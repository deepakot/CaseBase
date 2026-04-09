require('dotenv').config();
const { pinecone, index } = require('./src/config/pinecone');
const { db } = require('./src/config/firebase');

async function checkStatus() {
  try {
    console.log('--- Checking Firestore ---');
    const snapshot = await db.collection('documents').get();
    if (snapshot.empty) {
      console.log('No documents found in Firestore.');
    } else {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    }

    console.log('\n--- Checking Pinecone ---');
    const stats = await index.describeIndexStats();
    console.log('Pinecone Stats:', stats);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatus();
