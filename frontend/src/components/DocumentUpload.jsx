import React, { useState } from 'react';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DocumentUpload({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => f.type === 'application/pdf' || f.type === 'text/plain');
    
    if (validFiles.length !== selectedFiles.length) {
      setMessage({ type: 'error', text: 'Some files were ignored. Only PDF and TXT files are supported.' });
    } else {
      setMessage({ type: '', text: '' });
    }
    
    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    setMessage({ type: 'info', text: `Starting upload of ${files.length} files...` });

    let successCount = 0;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        setUploadProgress({ current: i + 1, total: files.length });
        
        // 1. Upload to Firebase Storage
        const documentId = `doc_${Date.now()}_${i}`;
        const storagePath = `uploads/${documentId}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, file);

        // 2. Notify Backend to start ingestion
        const response = await fetch(`${apiUrl}/api/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, storagePath })
        });

        if (!response.ok) throw new Error(`Failed to start ingestion for ${file.name}`);
        
        successCount++;
        
        // Trigger refresh of the document list after each successful upload initiation
        if (onUploadComplete) onUploadComplete();

      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    setFiles([]);
    document.getElementById('file-upload').value = '';

    if (successCount === files.length) {
      setMessage({ type: 'success', text: `Successfully uploaded ${successCount} files. They are now processing.` });
    } else {
      setMessage({ type: 'error', text: `Uploaded ${successCount} out of ${files.length} files. Check console for errors.` });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-600" />
        Upload Legal Documents
      </h2>
      
      <div className="flex flex-col gap-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.txt"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <label htmlFor="file-upload" className={`cursor-pointer flex flex-col items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
            <FileText className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {files.length > 0 
                ? `${files.length} file(s) selected` 
                : 'Click to select multiple PDF or TXT files'}
            </span>
          </label>
        </div>

        {files.length > 0 && !isUploading && (
          <ul className="text-xs text-gray-500 max-h-24 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-100">
            {files.map((f, idx) => (
              <li key={idx} className="truncate">{f.name}</li>
            ))}
          </ul>
        )}

        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading ({uploadProgress.current}/{uploadProgress.total})...
            </>
          ) : (
            'Upload & Process'
          )}
        </button>

        {message.text && (
          <div className={`flex items-start gap-2 text-sm p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            message.type === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {message.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {message.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {message.type === 'info' && <Loader2 className="w-4 h-4 mt-0.5 shrink-0 animate-spin" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
