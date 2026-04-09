require('dotenv').config();
const { index } = require('./src/config/pinecone');
const { db, bucket } = require('./src/config/firebase');

async function clearAllData() {
  try {
    console.log('--- Starting Fresh Wipe ---');

    // 1. Clear Pinecone
    console.log('\n1. Clearing Pinecone Vector Database...');
    try {
      await index.deleteAll();
      console.log('✅ Pinecone index cleared successfully.');
    } catch (e) {
      console.log('⚠️ Pinecone clear failed (it might already be empty):', e.message);
    }

    // 2. Clear Firestore Documents
    console.log('\n2. Clearing Firestore Metadata...');
    const snapshot = await db.collection('documents').get();
    if (snapshot.empty) {
      console.log('✅ Firestore is already empty.');
    } else {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${snapshot.size} documents from Firestore.`);
    }

    // 3. Clear Firebase Storage
    console.log('\n3. Clearing Firebase Storage (uploads/ folder)...');
    const [files] = await bucket.getFiles({ prefix: 'uploads/' });
    if (files.length === 0) {
      console.log('✅ Firebase Storage is already empty.');
    } else {
      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${files.length} files from Firebase Storage.`);
    }

    console.log('\n🎉 Fresh start complete! All databases and storage are empty.');

  } catch (error) {
    console.error('\n❌ Error during wipe:', error);
  }
}

clearAllData();
