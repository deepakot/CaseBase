const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newlines in the private key string
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin initialized successfully.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
};

initializeFirebase();

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
