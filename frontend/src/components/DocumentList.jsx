import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { FileText, ExternalLink, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function DocumentList({ refreshTrigger }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initially and whenever refreshTrigger changes
  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  // Poll every 5 seconds to update statuses automatically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDocuments();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDocument = async (storagePath) => {
    if (!storagePath) return;
    try {
      const fileRef = ref(storage, storagePath);
      const url = await getDownloadURL(fileRef);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error getting download URL:', error);
      alert('Could not open document. It may have been deleted from storage.');
    }
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading documents...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Document Library
        </h2>
        <button 
          onClick={fetchDocuments}
          className="text-gray-500 hover:text-blue-600 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {documents.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No documents uploaded yet.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
          {documents.map((doc) => (
            <li key={doc.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex flex-col overflow-hidden pr-4 w-full">
                <span className="font-medium text-gray-900 truncate text-sm" title={doc.title}>
                  {doc.title || 'Untitled Document'}
                </span>
                
                {/* AI Metadata Section */}
                {doc.status === 'processed' && doc.jurisdiction && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {doc.jurisdiction}
                      </span>
                      <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {doc.topics?.map((topic, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded whitespace-nowrap">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 italic line-clamp-2" title={doc.aiSummary}>
                      "{doc.aiSummary}"
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2 text-xs">
                  {/* Status Badge */}
                  <span className="flex items-center gap-1">
                    {doc.status === 'processed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                    {doc.status === 'processing' && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                    {doc.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                    
                    <span className={`capitalize ${
                      doc.status === 'processed' ? 'text-green-700' : 
                      doc.status === 'processing' ? 'text-blue-700' : 
                      'text-red-700'
                    }`}>
                      {doc.status}
                    </span>
                  </span>
                  
                  {/* Chunk Count */}
                  {doc.chunkCount > 0 && (
                    <span className="text-gray-500">
                      {doc.chunkCount} chunks
                    </span>
                  )}
                </div>
                {doc.error && (
                  <span className="text-xs text-red-500 mt-1 truncate" title={doc.error}>
                    {doc.error}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => handleViewDocument(doc.storagePath)}
                disabled={!doc.storagePath}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                title="View PDF"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
