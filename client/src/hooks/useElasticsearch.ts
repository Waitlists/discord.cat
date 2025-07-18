import { useState, useEffect } from 'react';
import { searchApiService, SearchResults, SearchStats, SearchHealth } from '../services/searchApi';

export interface SearchOptions {
  query?: string;
  author_id?: string;
  channel_id?: string;
  guild_id?: string;
  page?: number;
  size?: number;
  sort?: 'timestamp' | 'relevance';
}

export function useElasticsearchSearch() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (options: SearchOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Searching with Elasticsearch:', options);
      const searchResults = await searchApiService.searchMessages(options);
      console.log('✅ Search completed:', searchResults);
      setResults(searchResults);
    } catch (err) {
      console.error('❌ Search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}

export function useElasticsearchStats() {
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statsData = await searchApiService.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export function useElasticsearchHealth() {
  const [health, setHealth] = useState<SearchHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const healthData = await searchApiService.checkHealth();
      setHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    health,
    loading,
    error,
    refetch: checkHealth
  };
}