# Environment Variables Required

To run this project, you will need to provide the following keys. 

## Backend (`backend/.env`)

```env
PORT=8080

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="legal-cases"

# Firebase Admin (Service Account)
# You can generate this in Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_PRIVATE_KEY="your-private-key" # Make sure to handle newlines correctly if pasting directly, or point to a JSON file
FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
```

## Frontend (`frontend/.env`)

```env
# Firebase Client Config
# Found in Firebase Console -> Project Settings -> General -> Your apps
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# Backend API URL
VITE_API_URL="http://localhost:8080"
```