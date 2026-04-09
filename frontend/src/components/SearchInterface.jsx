import React, { useState } from 'react';
import { Search, Loader2, SlidersHorizontal, Info } from 'lucide-react';

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  
  // Advanced Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [threshold, setThreshold] = useState(0.25);
  const [maxResults, setMaxResults] = useState(5);

  const [similarResults, setSimilarResults] = useState([]);
  const [isFindingSimilar, setIsFindingSimilar] = useState(false);

  const handleFindSimilar = async (chunkId) => {
    setIsFindingSimilar(true);
    setSimilarResults([]);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/similar?chunkId=${encodeURIComponent(chunkId)}`);
      if (response.ok) {
        const data = await response.json();
        setSimilarResults(data.results);
        // Scroll to similar results
        setTimeout(() => {
          document.getElementById('similar-results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Failed to find similar cases:', err);
    } finally {
      setIsFindingSimilar(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError('');
    setResults([]);
    setSummary('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // Pass the dynamic threshold and maxResults to the backend
      const queryParams = new URLSearchParams({
        query: query,
        threshold: threshold.toString(),
        maxResults: maxResults.toString()
      });
      
      const eventSource = new EventSource(`${apiUrl}/api/summary/stream?${queryParams.toString()}`);

      eventSource.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        
        if (parsed.type === 'results') {
          setResults(parsed.data);
        } else if (parsed.type === 'chunk') {
          setSummary((prev) => prev + parsed.data);
        } else if (parsed.type === 'error') {
          setError(parsed.data);
          eventSource.close();
          setIsSearching(false);
        } else if (parsed.type === 'done') {
          eventSource.close();
          setIsSearching(false);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        setError('Connection to streaming server failed.');
        eventSource.close();
        setIsSearching(false);
      };

    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching.');
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., breach of contract in retail..."
          className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Advanced Settings Toggle */}
      <div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showSettings ? 'Hide Advanced RAG Settings' : 'Show Advanced RAG Settings'}
        </button>
        
        {showSettings && (
          <div className="mt-4 p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-6">
            
            {/* Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  Similarity Threshold
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      Controls how strict the semantic matching is. Higher values require a closer match. Lower values allow broader, more exploratory matches. (Typical range for 1024-dim embeddings: 0.20 - 0.50)
                    </div>
                  </div>
                </label>
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-200">
                  {threshold.toFixed(2)}
                </span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="0.8" 
                step="0.01" 
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Broad (0.1)</span>
                <span>Strict (0.8)</span>
              </div>
            </div>

            {/* Max Results Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  Max Context Chunks
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      The maximum number of text snippets retrieved from the vector database and fed to the AI. More chunks provide more context but can dilute the AI's focus.
                    </div>
                  </div>
                </label>
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-200">
                  {maxResults}
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1" 
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 Chunk</span>
                <span>10 Chunks</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Streaming Summary */}
      {(summary || isSearching) && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            AI Summary
            {isSearching && !summary && <Loader2 className="w-4 h-4 animate-spin" />}
          </h3>
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {summary || 'Analyzing retrieved cases...'}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Retrieved Context</h3>
          {results.map((result, idx) => (
            <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-blue-900">{result.documentTitle || 'Unknown Document'}</h4>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleFindSimilar(result.id)}
                    disabled={isFindingSimilar}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
                  >
                    Find Similar Cases
                  </button>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Score: {result.score.toFixed(3)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                "...{result.textSnippet}..."
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Similar Results Section */}
      {similarResults.length > 0 && (
        <div id="similar-results-section" className="flex flex-col gap-4 mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Conceptually Similar Cases
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            These cases were found by comparing the mathematical vector of the selected paragraph against the entire database.
          </p>
          {similarResults.map((result, idx) => (
            <div key={`sim-${idx}`} className="bg-indigo-50 p-5 rounded-lg shadow-sm border border-indigo-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-indigo-900">{result.documentTitle || 'Unknown Document'}</h4>
                <span className="text-xs font-mono bg-indigo-200 text-indigo-800 px-2 py-1 rounded">
                  Similarity: {(result.score * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "...{result.textSnippet}..."
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
