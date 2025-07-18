import { DiscordMessage } from '../types';

export interface SearchResults {
  messages: DiscordMessage[];
  total: number;
  page: number;
  size: number;
  took: number;
}

export interface SearchStats {
  total_messages: number;
  unique_authors: number;
  unique_channels: number;
  unique_guilds: number;
}

export interface SearchHealth {
  connected: boolean;
  service: string;
  timestamp: string;
  error?: string;
}

class SearchApiService {
  private baseUrl = '/api/search';

  async searchMessages(params: {
    q?: string;
    author_id?: string;
    channel_id?: string;
    guild_id?: string;
    page?: number;
    size?: number;
    sort?: 'timestamp' | 'relevance';
  }): Promise<SearchResults> {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.append('q', params.q);
    if (params.author_id) searchParams.append('author_id', params.author_id);
    if (params.channel_id) searchParams.append('channel_id', params.channel_id);
    if (params.guild_id) searchParams.append('guild_id', params.guild_id);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${this.baseUrl}/messages?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getStats(): Promise<SearchStats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    
    if (!response.ok) {
      throw new Error(`Stats failed: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async checkHealth(): Promise<SearchHealth> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

export const searchApiService = new SearchApiService();