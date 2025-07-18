import { useEffect, useState } from 'react';
import { Database, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ElasticsearchHealth {
  connected: boolean;
  service: string;
  timestamp: string;
  error?: string;
}

const ElasticsearchStatus: React.FC = () => {
  const [health, setHealth] = useState<ElasticsearchHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/search/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to check Elasticsearch health:', error);
      setHealth({
        connected: false,
        service: 'elasticsearch',
        timestamp: new Date().toISOString(),
        error: 'Failed to connect to backend'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking Elasticsearch...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      health?.connected 
        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
    }`}>
      {health?.connected ? (
        <>
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Elasticsearch Connected</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Using JSON files (Elasticsearch offline)</span>
        </>
      )}
      <button
        onClick={checkHealth}
        className="ml-auto p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
        title="Refresh connection status"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
};

export default ElasticsearchStatus;