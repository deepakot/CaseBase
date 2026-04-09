import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import SearchInterface from './components/SearchInterface';
import DocumentList from './components/DocumentList';
import { Scale, BookOpen, Zap, Network, FileSearch } from 'lucide-react';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Mini Legal Casebase</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium hidden sm:block">
            AI-Powered RAG Prototype
          </div>
        </div>
      </header>

      {/* Feature Overview Banner */}
      <div className="bg-indigo-900 text-white py-8 border-b border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-300 mb-1">
                <Zap className="w-5 h-5" />
                <h3 className="font-semibold text-white">AI Auto-Tagging</h3>
              </div>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Upload a PDF and the system uses GPT-4o-mini to automatically extract the jurisdiction, key legal topics, and a 1-sentence headnote summary.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-300 mb-1">
                <FileSearch className="w-5 h-5" />
                <h3 className="font-semibold text-white">Semantic Search</h3>
              </div>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Search using natural language (e.g., "unsafe scaffolding"). The system uses OpenAI embeddings (1024-dim) to find conceptual matches, not just keywords.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-300 mb-1">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-semibold text-white">Streaming Summaries</h3>
              </div>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Retrieves the top 5 most relevant chunks from Pinecone and streams a synthesized AI summary back to the UI in real-time using Server-Sent Events (SSE).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-300 mb-1">
                <Network className="w-5 h-5" />
                <h3 className="font-semibold text-white">Vector "Noteup"</h3>
              </div>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Click "Find Similar Cases" on any result to perform a pure vector-to-vector search, finding conceptually identical paragraphs across the entire database.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Search & Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Semantic Search</h2>
              <p className="text-gray-600 mb-6">
                Search through uploaded legal cases using natural language. The AI will retrieve the most relevant snippets and synthesize a summary.
              </p>
              <SearchInterface />
            </div>
          </div>

          {/* Right Column: Upload & Document List */}
          <div className="lg:col-span-1 space-y-6">
            <DocumentUpload onUploadComplete={handleUploadComplete} />
            <DocumentList refreshTrigger={refreshTrigger} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
