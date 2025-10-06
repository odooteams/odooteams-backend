import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface IndexingStatus {
  url: string;
  status: 'indexed' | 'not_indexed' | 'pending' | 'error';
  lastCrawled?: string;
  errors?: string[];
}

interface SearchConsoleData {
  totalPages: number;
  indexedPages: number;
  notIndexedPages: number;
  crawlErrors: number;
  lastUpdated: string;
}

export const useSearchConsoleTracking = () => {
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus[]>([]);
  const [consoleData, setConsoleData] = useState<SearchConsoleData | null>(null);
  const location = useLocation();

  // Track page views for indexing monitoring
  useEffect(() => {
    const trackPageForIndexing = async () => {
      const currentUrl = `https://odooteams.com${location.pathname}`;
      
      // Submit URL to Google for indexing (requires API key)
      try {
        // This would be implemented with Google Search Console API
        // For now, we'll simulate the tracking
        const newStatus: IndexingStatus = {
          url: currentUrl,
          status: 'pending',
          lastCrawled: new Date().toISOString()
        };
        
        setIndexingStatus(prev => {
          const existing = prev.find(item => item.url === currentUrl);
          if (existing) {
            return prev.map(item => 
              item.url === currentUrl ? { ...item, ...newStatus } : item
            );
          }
          return [...prev, newStatus];
        });
      } catch (error) {
        console.error('Failed to track page for indexing:', error);
      }
    };

    trackPageForIndexing();
  }, [location.pathname]);

  // Request indexing for specific URL
  const requestIndexing = async (url: string) => {
    try {
      // Google Search Console API call would go here
      // POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
      console.log(`Requesting indexing for: ${url}`);
      
      // Simulate API response
      setIndexingStatus(prev => 
        prev.map(item => 
          item.url === url 
            ? { ...item, status: 'pending' as const, lastCrawled: new Date().toISOString() }
            : item
        )
      );
      
      return { success: true, message: 'Indexing requested successfully' };
    } catch (error) {
      console.error('Failed to request indexing:', error);
      return { success: false, message: 'Failed to request indexing' };
    }
  };

  // Batch request indexing for multiple URLs
  const batchRequestIndexing = async (urls: string[]) => {
    const results = await Promise.allSettled(
      urls.map(url => requestIndexing(url))
    );
    
    return results.map((result, index) => ({
      url: urls[index],
      success: result.status === 'fulfilled' && result.value.success,
      message: result.status === 'fulfilled' ? result.value.message : 'Failed'
    }));
  };

  return {
    indexingStatus,
    consoleData,
    requestIndexing,
    batchRequestIndexing
  };
};

// Component to display Search Console insights
export const SearchConsoleInsights: React.FC = () => {
  const { indexingStatus, consoleData } = useSearchConsoleTracking();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Search Console Status</h3>
      
      {consoleData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{consoleData.indexedPages}</div>
            <div className="text-sm text-gray-600">Indexed Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{consoleData.notIndexedPages}</div>
            <div className="text-sm text-gray-600">Not Indexed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{consoleData.crawlErrors}</div>
            <div className="text-sm text-gray-600">Crawl Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{consoleData.totalPages}</div>
            <div className="text-sm text-gray-600">Total Pages</div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {indexingStatus.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded">
            <div className="flex-1 truncate">
              <span className="text-sm">{item.url}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${
                item.status === 'indexed' ? 'bg-green-100 text-green-800' :
                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                item.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.status}
              </span>
              {item.lastCrawled && (
                <span className="text-xs text-gray-500">
                  {new Date(item.lastCrawled).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchConsoleInsights;