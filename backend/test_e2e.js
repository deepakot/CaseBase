require('dotenv').config();
const { processDocument } = require('./src/services/ingestion');
const { performSearch } = require('./src/services/retrieval');
const { bucket } = require('./src/config/firebase');

async function testEndToEnd() {
  try {
    console.log('--- Starting End-to-End Test ---');

    // 1. Upload ACCC_v_MegaMart_2022.pdf (contains "deceptive")
    const filePath = '../sample_data/ACCC_v_MegaMart_2022.pdf';
    const storagePath = 'uploads/test_accc.pdf';
    const documentId = 'test_doc_accc';
    
    console.log(`\n1. Uploading ${filePath} to Firebase Storage...`);
    await bucket.upload(filePath, { destination: storagePath });
    
    console.log('\n2. Processing document (Extract -> Chunk -> Embed -> Pinecone)...');
    await processDocument(documentId, storagePath);
    console.log('Ingestion complete!');

    // 2. Search for "deceptive"
    console.log('\n3. Searching for "deceptive"...');
    const results = await performSearch('deceptive');
    
    console.log('\n--- Search Results ---');
    if (results.length === 0) {
      console.log('No results found.');
    } else {
      results.forEach((r, i) => {
        console.log(`\nResult ${i + 1} (Score: ${r.score.toFixed(3)}):`);
        console.log(`Document: ${r.documentTitle}`);
        console.log(`Snippet: ${r.textSnippet.substring(0, 150)}...`);
      });
    }

  } catch (e) {
    console.error('\nTest failed:', e);
  }
}

testEndToEnd();
