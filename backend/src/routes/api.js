const express = require('express');
const router = express.Router();
const { processDocument } = require('../services/ingestion');
const { performSearch, findSimilarChunks } = require('../services/retrieval');
const { openai } = require('../config/openai');
const { db } = require('../config/firebase');

/**
 * GET /api/documents
 * Fetches all uploaded documents and their processing status.
 */
router.get('/documents', async (req, res) => {
  try {
    const snapshot = await db.collection('documents').get();
    const documents = [];
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by updatedAt descending in memory to avoid needing a Firestore index
    documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * POST /api/ingest
 * Triggered by the frontend after a file is uploaded to Firebase Storage.
 * Body: { documentId: string, storagePath: string }
 */
router.post('/ingest', async (req, res) => {
  const { documentId, storagePath } = req.body;

  if (!documentId || !storagePath) {
    return res.status(400).json({ error: 'documentId and storagePath are required' });
  }

  res.status(202).json({ message: 'Ingestion started', documentId });

  // Run in background
  processDocument(documentId, storagePath).catch(err => {
    console.error('Background ingestion failed:', err);
  });
});

/**
 * POST /api/search
 * Performs a semantic search and returns the top chunks.
 * Body: { query: string }
 */
router.post('/search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const results = await performSearch(query);
    res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

/**
 * GET /api/summary/stream
 * Streams an AI-generated summary based on the search query and retrieved context.
 * Query params: ?query=...&threshold=0.25&maxResults=5
 */
router.get('/summary/stream', async (req, res) => {
  const { query } = req.query;
  const threshold = parseFloat(req.query.threshold) || 0.25;
  const maxResults = parseInt(req.query.maxResults) || 5;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // 1. Perform search to get context (fetch up to 30 to allow for deduplication and thresholding)
    let results = await performSearch(query, 30);
    
    // Apply dynamic threshold and limit to maxResults
    results = results.filter(r => r.score >= threshold).slice(0, maxResults);
    
    // Send the raw results first so the UI can display them immediately
    res.write(`data: ${JSON.stringify({ type: 'results', data: results })}\n\n`);

    // 2. Prepare context for the LLM
    let contextText = '';
    if (results && results.length > 0) {
      contextText = results.map((r, i) => `[Document: ${r.documentTitle}]\n${r.textSnippet}`).join('\n\n');
    } else {
      contextText = "No highly relevant legal cases found in the database for this specific query based on the current similarity threshold.";
    }

    const prompt = `
You are a legal assistant. Summarize the following legal case excerpts to answer the user's query.
If the excerpts do not contain relevant information, state that clearly.
Always cite the document titles when referencing specific facts.

User Query: "${query}"

Context:
${contextText}

Instructions:
1. Focus ONLY on the excerpts that directly answer or relate to the User Query.
2. Ignore any generic legal filler text (e.g., discussions about "equitable remedies", "statutory interpretation", or "evidentiary burdens") unless it directly relates to the query.
3. If a specific case perfectly matches the query, highlight that case prominently.
`;

    // 3. Stream the OpenAI response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', data: content })}\n\n`);
      }
    }

    // 4. End the stream
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/similar
 * Finds similar cases based on a specific chunk ID
 * Query params: ?chunkId=...
 */
router.get('/similar', async (req, res) => {
  const { chunkId } = req.query;

  if (!chunkId) {
    return res.status(400).json({ error: 'chunkId is required' });
  }

  try {
    const results = await findSimilarChunks(chunkId);
    res.status(200).json({ results });
  } catch (error) {
    console.error('Similar search error:', error);
    res.status(500).json({ error: 'Failed to find similar cases', details: error.message });
  }
});

module.exports = router;
