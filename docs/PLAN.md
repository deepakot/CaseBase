# Plan: Mini Legal Casebase Search Engine

**Spec**: 001-legal-casebase/SPEC.md
**Status**: Approved
**Created**: 2026-04-06
**Constitution**: v1.0.0

---

## Technical Context

### Current State

This is a greenfield prototype project for a technical interview. No existing code exists. The goal is to demonstrate a production-grade RAG (Retrieval-Augmented Generation) architecture.

### Stack & Dependencies

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Frontend | React (Vite) | Latest | Client-side UI |
| Styling | Tailwind CSS | Latest | Utility-first CSS framework |
| Backend | Node.js + Express | v20+ | API server |
| File Storage | Firebase Storage | Latest | Storing raw uploaded PDFs |
| Metadata DB | Firebase Firestore | Latest | Tracking document status |
| Vector DB | Pinecone | Latest | Serverless vector database |
| AI / LLM | OpenAI API | Latest | Embeddings (`text-embedding-3-small`) & Chat (`gpt-4o-mini`) |
| PDF Parsing | pdf-parse | Latest | Extracting text from PDFs |
| RAG Utils | LangChain (JS) | Latest | Text splitting and orchestration |

### Constraints

- Must be a prototype but demonstrate production-grade architecture.
- Must clearly separate frontend and backend.
- Must implement a clear RAG flow.
- Must use React, Node.js, Firebase, and Google Cloud concepts.

---

## Architecture

### Component Overview

```
[React Frontend] 
       │
       ├── (1) Upload PDF ──> [Firebase Storage]
       │                           │
       ├── (2) Notify Backend ──> [Node.js Express Backend]
       │                               │
       │                               ├── Download PDF
       │                               ├── Extract Text (pdf-parse)
       │                               ├── Chunk Text (LangChain)
       │                               ├── Get Embeddings (OpenAI)
       │                               └── Upsert Vectors (Pinecone)
       │
       └── (3) Search Query ──> [Node.js Express Backend]
                                       │
                                       ├── Embed Query (OpenAI)
                                       ├── Search Vectors (Pinecone)
                                       ├── Retrieve Top Chunks
                                       ├── Generate Summary (OpenAI)
                                       └── Stream Response (SSE) -> [React Frontend]
```

### Data Flow

**Ingestion Flow:**
1. User uploads PDF via React UI.
2. React uploads file to Firebase Storage and creates a "pending" doc in Firestore.
3. React calls Backend `/api/ingest` with the document ID.
4. Backend downloads PDF, extracts text, splits into chunks.
5. Backend calls OpenAI to embed chunks.
6. Backend upserts embeddings + metadata to Pinecone.
7. Backend updates Firestore doc status to "processed".

**Retrieval Flow:**
1. User submits search query via React UI.
2. React calls Backend `/api/search` with the query.
3. Backend embeds the query via OpenAI.
4. Backend queries Pinecone for top 5 similar chunks.
5. Backend initiates an OpenAI Chat completion using the retrieved chunks as context.
6. Backend streams the summary back to React via Server-Sent Events (SSE), along with the raw snippet data.

### Integration Points

| System | Interface | Direction | Notes |
|--------|-----------|-----------|-------|
| Firebase Storage | Firebase Admin SDK | Both | Store/Retrieve PDFs |
| Firestore | Firebase Admin SDK | Both | Document metadata |
| Pinecone | Pinecone Node SDK | Both | Vector storage and retrieval |
| OpenAI | OpenAI Node SDK | Out | Embeddings and Chat Completions |

---

## Phased Approach

### Phase 0: Setup & Infrastructure

- Initialize Git repository.
- Setup Firebase project (Storage, Firestore).
- Setup Pinecone index (`legal-cases`, dimension 1536, cosine metric).
- Obtain OpenAI API key.
- Create `.env` files for frontend and backend.

### Phase 1: Backend Foundation & Ingestion (Pipeline A)

- Initialize Node.js Express server.
- Setup Firebase Admin SDK.
- Create `/api/ingest` endpoint.
- Implement PDF downloading and text extraction (`pdf-parse`).
- Implement text chunking (`RecursiveCharacterTextSplitter`).
- Implement OpenAI embeddings generation.
- Implement Pinecone upsert logic.

### Phase 2: Backend Retrieval & RAG (Pipeline B)

- Create `/api/search` endpoint.
- Implement query embedding.
- Implement Pinecone similarity search.
- Implement OpenAI Chat Completion with RAG prompt.
- Implement Server-Sent Events (SSE) for streaming the summary response.

### Phase 3: Frontend Development

- Initialize React app with Vite and Tailwind CSS.
- Build `DocumentUpload` component (Firebase Storage integration).
- Build `SearchBar` component.
- Build `SearchResults` component (displaying snippets and relevance scores).
- Build `StreamingSummary` component (handling SSE connection).

### Phase 4: Polish & Documentation

- Add error handling and loading states.
- Write clean, modular code with comments.
- Create a comprehensive `README.md` explaining the architecture and setup instructions.

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PDF Parsing Failures | Medium | High | Use robust `pdf-parse` library; add error handling for scanned/image-only PDFs. |
| Pinecone Index Mismatch | Low | High | Ensure embedding dimensions (1536 for OpenAI) exactly match Pinecone index settings. |
| SSE Connection Drops | Medium | Medium | Implement robust error handling and reconnection logic on the frontend for the streaming summary. |

---

## Quickstart

### Prerequisites

- Node.js v20+
- Firebase Project (Storage & Firestore enabled)
- Pinecone Account
- OpenAI API Key

### Setup

```bash
# Clone repository
git clone <repo-url>
cd legal-casebase-prototype

# Setup Backend
cd backend
npm install
cp .env.example .env # Fill in API keys
npm run dev

# Setup Frontend
cd ../frontend
npm install
cp .env.example .env # Fill in Firebase config
npm run dev
```
