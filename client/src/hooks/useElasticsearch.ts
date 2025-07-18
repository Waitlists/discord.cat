import { useState, useEffect } from 'react';
import { DiscordMessage, SearchFilters, MessageStats } from '../types';

interface SearchResult {
  messages: DiscordMessage[];
  total: number;
  took: number;
}

interface ElasticsearchHealth {
  connected: boolean;
  service: string;
  timestamp: string;
  error?: string;
}

export const useElasticsearchSearch = () => {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (filters: SearchFilters, page: number = 1, limit: number = 50) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.content && { content: filters.content }),
        ...(filters.authorId && { authorId: filters.authorId }),
        ...(filters.channelId && { channelId: filters.channelId }),
        ...(filters.guildId && { guildId: filters.guildId }),
      });

      const response = await fetch(`/api/search/messages?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
  };

  return { search, results, loading, error, reset };
};

export const useElasticsearchHealth = () => {
  const [health, setHealth] = useState<ElasticsearchHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/search/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
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
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { health, loading, checkHealth };
};

export const useElasticsearchStats = () => {
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/search/stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};