const { index } = require('../config/pinecone');
const { openai } = require('../config/openai');
const { db } = require('../config/firebase');

/**
 * Generates an embedding for a search query
 * @param {string} query 
 * @returns {Promise<number[]>}
 */
const embedQuery = async (query) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    dimensions: 1024, // Match the Pinecone index dimension
  });
  return response.data[0].embedding;
};

/**
 * Searches Pinecone for the most relevant chunks
 * @param {number[]} queryEmbedding 
 * @param {number} topK 
 * @returns {Promise<Array>}
 */
const searchVectors = async (queryEmbedding, topK = 5) => {
  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });
  return queryResponse.matches;
};

/**
 * Enriches Pinecone results with Firestore document metadata (like title)
 * and removes exact duplicate text snippets.
 * @param {Array} matches 
 * @returns {Promise<Array>}
 */
const enrichResults = async (matches) => {
  const enriched = [];
  // Cache to avoid fetching the same document multiple times
  const docCache = {};
  // Set to track unique snippets and prevent duplicates
  const seenSnippets = new Set();

  for (const match of matches) {
    const { documentId, textSnippet } = match.metadata;
    
    // Skip if we've already added this exact snippet
    if (seenSnippets.has(textSnippet)) {
      continue;
    }
    seenSnippets.add(textSnippet);
    
    if (!docCache[documentId]) {
      const docRef = await db.collection('documents').doc(documentId).get();
      if (docRef.exists) {
        docCache[documentId] = docRef.data();
      } else {
        docCache[documentId] = { title: 'Unknown Document' };
      }
    }

    enriched.push({
      id: match.id,
      score: match.score,
      documentId,
      documentTitle: docCache[documentId].title,
      textSnippet,
    });
  }

  return enriched;
};

/**
 * Main search pipeline
 * @param {string} query 
 * @param {number} fetchCount - How many raw results to fetch from Pinecone before filtering
 * @returns {Promise<Array>}
 */
const performSearch = async (query, fetchCount = 30) => {
  console.log(`Embedding query: "${query}"`);
  const queryEmbedding = await embedQuery(query);

  console.log(`Searching Pinecone...`);
  // Fetch more results initially because we will filter them by threshold later
  const matches = await searchVectors(queryEmbedding, fetchCount);

  console.log(`Enriching results...`);
  const results = await enrichResults(matches);

  return results;
};

/**
 * Finds similar chunks based on an existing chunk ID
 * @param {string} chunkId 
 * @param {number} topK 
 * @returns {Promise<Array>}
 */
const findSimilarChunks = async (chunkId, topK = 5) => {
  console.log(`Fetching vector for chunk: ${chunkId}`);
  
  // 1. Fetch the vector for the given chunk ID
  const fetchResponse = await index.fetch({ ids: [chunkId] });
  const record = fetchResponse.records ? fetchResponse.records[chunkId] : null;
  
  if (!record) {
    throw new Error('Chunk not found in Pinecone');
  }

  console.log(`Searching Pinecone for similar vectors...`);
  // 2. Query Pinecone using that exact vector
  const matches = await searchVectors(record.values, 15);

  // 3. Enrich and deduplicate
  const results = await enrichResults(matches);

  // 4. Filter out the original chunk itself and return topK
  return results.filter(r => r.id !== chunkId).slice(0, topK);
};

module.exports = {
  performSearch,
  findSimilarChunks
};
