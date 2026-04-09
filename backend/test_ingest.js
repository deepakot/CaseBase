require('dotenv').config();
const { processDocument } = require('./src/services/ingestion');
const fs = require('fs');
const path = require('path');
const { bucket } = require('./src/config/firebase');

async function test() {
  try {
    const filePath = '../sample_data/Smith_v_RetailCorp_2023.pdf';
    const storagePath = 'uploads/test_smith.pdf';
    
    // Upload to Firebase Storage first
    console.log('Uploading to Firebase Storage...');
    await bucket.upload(filePath, { destination: storagePath });
    
    console.log('Processing document...');
    await processDocument('test_doc_1', storagePath);
    console.log('Done!');
  } catch (e) {
    console.error(e);
  }
}

test();
