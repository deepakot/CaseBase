const { db, bucket } = require('../config/firebase');
const { index } = require('../config/pinecone');
const { openai } = require('../config/openai');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { v4: uuidv4 } = require('uuid');

/**
 * Downloads a file from Firebase Storage
 * @param {string} filePath - Path to the file in the bucket
 * @returns {Promise<Buffer>}
 */
const downloadFile = async (filePath) => {
  const file = bucket.file(filePath);
  const [buffer] = await file.download();
  return buffer;
};

/**
 * Extracts text from a PDF buffer using pdfjs-dist
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
const extractTextFromPDF = async (buffer) => {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
};

/**
 * Splits text into semantic chunks
 * @param {string} text 
 * @returns {Promise<string[]>}
 */
const chunkText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const docs = await splitter.createDocuments([text]);
  return docs.map(doc => doc.pageContent);
};

/**
 * Generates embeddings for an array of text chunks
 * @param {string[]} chunks 
 * @returns {Promise<number[][]>}
 */
const generateEmbeddings = async (chunks) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
    dimensions: 1024, // Match the Pinecone index dimension
  });
  
  return response.data.map(item => item.embedding);
};

/**
 * Uses OpenAI to extract metadata (tags, jurisdiction, summary) from the document text
 * @param {string} text 
 */
const extractMetadataWithAI = async (text) => {
  try {
    // Only send the first 4000 characters to save tokens and time (usually contains the headnotes/summary)
    const textSample = text.substring(0, 4000);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: 'You are a legal analyst. Extract metadata from the provided legal document text. Respond ONLY with a JSON object containing: "jurisdiction" (string, e.g., "High Court of Australia"), "topics" (array of 3-5 short string tags, e.g., ["Contracts", "Negligence"]), and "summary" (a 1-sentence summary of the case).'
        },
        {
          role: 'user',
          content: textSample
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Metadata extraction failed:', error);
    return { jurisdiction: 'Unknown', topics: [], summary: 'Metadata extraction failed.' };
  }
};

/**
 * Main ingestion pipeline
 * @param {string} documentId - Firestore document ID
 * @param {string} storagePath - Path in Firebase Storage
 */
const processDocument = async (documentId, storagePath) => {
  try {
    // 1. Update status to processing (create document if it doesn't exist)
    await db.collection('documents').doc(documentId).set({
      status: 'processing',
      updatedAt: new Date().toISOString(),
      title: storagePath.split('/').pop(), // Use filename as title initially
      storagePath: storagePath
    }, { merge: true });

    // 2. Download file
    console.log(`Downloading ${storagePath}...`);
    const buffer = await downloadFile(storagePath);

    // 3. Extract text
    console.log(`Extracting text...`);
    let text = '';
    if (storagePath.toLowerCase().endsWith('.pdf')) {
      text = await extractTextFromPDF(buffer);
    } else {
      // Assume text file
      text = buffer.toString('utf-8');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the document.');
    }

    // 3.5 Extract AI Metadata (NEW FEATURE)
    console.log(`Extracting AI Metadata...`);
    const aiMetadata = await extractMetadataWithAI(text);

    // 4. Chunk text
    console.log(`Chunking text...`);
    const chunks = await chunkText(text);
    console.log(`Created ${chunks.length} chunks.`);

    // 5. Generate embeddings
    console.log(`Generating embeddings...`);
    const embeddings = await generateEmbeddings(chunks);

    // 6. Prepare vectors for Pinecone
    const vectors = chunks.map((chunk, i) => ({
      id: `${documentId}-chunk-${i}`,
      values: embeddings[i],
      metadata: {
        documentId,
        textSnippet: chunk,
        chunkIndex: i
      }
    }));

    // 7. Upsert to Pinecone
    console.log(`Upserting to Pinecone...`);
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert({ records: batch });
    }

    // 8. Update status to processed WITH AI METADATA
    await db.collection('documents').doc(documentId).set({
      status: 'processed',
      chunkCount: chunks.length,
      updatedAt: new Date().toISOString(),
      jurisdiction: aiMetadata.jurisdiction,
      topics: aiMetadata.topics,
      aiSummary: aiMetadata.summary
    }, { merge: true });

    console.log(`Document ${documentId} processed successfully.`);
    return { success: true, chunks: chunks.length };

  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    // Update status to error
    await db.collection('documents').doc(documentId).set({
      status: 'error',
      error: error.message,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    throw error;
  }
};

module.exports = {
  processDocument
};
