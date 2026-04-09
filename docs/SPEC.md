# Spec: Mini Legal Casebase Search Engine

**Spec ID**: 001-legal-casebase
**Status**: Approved
**Created**: 2026-04-06
**Constitution**: v1.0.0

---

## Summary

The Mini Legal Casebase Search Engine is a prototype web application designed to demonstrate a production-grade Retrieval-Augmented Generation (RAG) architecture. It allows legal researchers to upload legal case summaries or judgments (in PDF or text format), which are then processed, chunked, and embedded into a vector database. Users can then perform natural language searches (e.g., "breach of contract in retail") to find semantically relevant cases. The system returns ranked results with extracted snippets for context, and features a streaming AI-generated summary of the findings to quickly synthesize the legal precedent.

---

## User Stories

### US-001 [P1] Document Ingestion

**As a** legal researcher,
**I want** to upload PDF or text files containing legal case summaries,
**So that** they can be indexed and made searchable in the system.

#### Acceptance Scenarios

**AC-001**: Successful PDF Upload
- **Given** I am on the upload page
- **When** I select a valid PDF file and click "Upload"
- **Then** the file is uploaded, processed, and I see a success message indicating it is ready for search.

**AC-002**: Unsupported File Type
- **Given** I am on the upload page
- **When** I select an image file (e.g., .jpg) and click "Upload"
- **Then** I see an error message stating that only PDF and TXT files are supported.

### US-002 [P1] Semantic Search

**As a** legal researcher,
**I want** to search the casebase using natural language queries,
**So that** I can find relevant cases without needing to know exact keyword matches.

#### Acceptance Scenarios

**AC-003**: Natural Language Query
- **Given** the system has indexed several legal cases
- **When** I enter "breach of contract in retail" into the search bar
- **Then** I see a list of relevant cases ranked by semantic similarity.

### US-003 [P1] Contextual Snippets

**As a** legal researcher,
**I want** to see extracted snippets and relevance scores for each search result,
**So that** I can quickly verify why a case was returned and read the relevant context.

#### Acceptance Scenarios

**AC-004**: View Search Results
- **Given** I have performed a search
- **When** the results are displayed
- **Then** each result shows the document title, a relevance score, and the exact text snippet that matched my query.

### US-004 [P2] AI-Generated Summaries

**As a** legal researcher,
**I want** to read an AI-generated summary of the search results,
**So that** I can quickly understand the overarching legal precedent across the retrieved cases.

#### Acceptance Scenarios

**AC-005**: Streaming Summary
- **Given** I have performed a search
- **When** the results are loading
- **Then** I see an AI-generated summary streaming onto the page in real-time, synthesizing the top retrieved cases.

---

## Functional Requirements

| ID | Requirement | Traces To | Priority |
|----|-------------|-----------|----------|
| FR-001 | The system must accept PDF and TXT file uploads via the frontend UI. | US-001 | P1 |
| FR-002 | The backend must extract text from uploaded documents. | US-001 | P1 |
| FR-003 | The backend must split extracted text into semantic chunks with overlap. | US-001 | P1 |
| FR-004 | The backend must generate vector embeddings for text chunks using an LLM API. | US-001 | P1 |
| FR-005 | The backend must store embeddings and metadata (doc ID, snippet) in a vector database. | US-001 | P1 |
| FR-006 | The system must provide a search interface accepting natural language text. | US-002 | P1 |
| FR-007 | The backend must convert search queries into embeddings and query the vector database. | US-002 | P1 |
| FR-008 | The frontend must display search results including document title, snippet, and score. | US-003 | P1 |
| FR-009 | The backend must send retrieved chunks and the user query to an LLM to generate a summary. | US-004 | P2 |
| FR-010 | The backend must stream the LLM summary response to the frontend using Server-Sent Events (SSE). | US-004 | P2 |

---

## Non-Functional Requirements

| ID | Category | Requirement | Traces To |
|----|----------|-------------|-----------|
| NFR-001 | Architecture | Clear separation of concerns between frontend (React) and backend (Node.js). | All |
| NFR-002 | Code Quality | Code must be modular, clean, and well-documented. | All |
| NFR-003 | Performance | Search results (excluding streaming summary) should return in < 2 seconds. | US-002 |
| NFR-004 | UX | The UI must be clean, modern, and responsive (using Tailwind CSS). | All |

---

## Success Criteria

1. A user can successfully upload a PDF legal case and have it indexed without errors.
2. A user can search using natural language and receive semantically relevant results.
3. The search results page displays a real-time, streaming AI summary based on the retrieved context.
4. The codebase demonstrates production-grade architecture (clear RAG flow, separated frontend/backend, documented code).

---

## Key Entities

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Document | A legal case file uploaded by the user. | id, title, uploadDate, status, storageUrl |
| Chunk | A semantic segment of text extracted from a Document. | id, documentId, textSnippet, pageNumber, embedding |
| SearchResult | A matched chunk returned from the vector database. | chunkId, documentTitle, textSnippet, relevanceScore |

---

## Out of Scope

- User authentication and authorization (RBAC).
- OCR for scanned, image-based PDFs (only text-based PDFs are supported for this prototype).
- Complex document management (editing, deleting, or organizing documents into folders).
- Persistent chat history (each search is a stateless RAG query).

---

## Open Questions

- None at this time.

---

## Clarifications

- We will use Firebase Storage for raw files, Firestore for document metadata, Pinecone for the vector database, and OpenAI for embeddings and summarization.
