const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME || 'legal-cases';
const index = pinecone.index(indexName);

module.exports = { pinecone, index };
