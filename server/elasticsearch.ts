import { Client } from '@elastic/elasticsearch';
import { DiscordMessage } from '@shared/schema';

export class ElasticsearchService {
  private client: Client;
  private readonly INDEX_NAMES = ['chunk1', 'chunk2'];

  constructor() {
    console.log('🔧 Initializing Elasticsearch service...');
    console.log('🔧 Environment variables check:');
    console.log('   ELASTICSEARCH_CLOUD_ID:', !!process.env.ELASTICSEARCH_CLOUD_ID);
    console.log('   ELASTICSEARCH_USERNAME:', !!process.env.ELASTICSEARCH_USERNAME);
    console.log('   ELASTICSEARCH_PASSWORD:', !!process.env.ELASTICSEARCH_PASSWORD);
    console.log('   ELASTICSEARCH_API_KEY:', !!process.env.ELASTICSEARCH_API_KEY);
    console.log('   ELASTICSEARCH_URL:', !!process.env.ELASTICSEARCH_URL);

    // Initialize Elasticsearch client
    if (process.env.ELASTICSEARCH_CLOUD_ID) {
      // Use Elastic Cloud
      const hasApiKey = process.env.ELASTICSEARCH_API_KEY;
      const hasCredentials = process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD;
      
      console.log('🔧 Elasticsearch Cloud ID detected');
      console.log('🔧 API Key provided:', !!hasApiKey);
      console.log('🔧 Username provided:', !!process.env.ELASTICSEARCH_USERNAME);
      console.log('🔧 Password provided:', !!process.env.ELASTICSEARCH_PASSWORD);
      
      if (hasApiKey) {
        // Use API key authentication (preferred)
        this.client = new Client({
          cloud: {
            id: process.env.ELASTICSEARCH_CLOUD_ID
          },
          auth: {
            apiKey: process.env.ELASTICSEARCH_API_KEY
          }
        });
        console.log('🔧 Elasticsearch configured with API key');
      } else if (hasCredentials) {
        // Use username/password authentication (preferred)
        this.client = new Client({
          cloud: {
            id: process.env.ELASTICSEARCH_CLOUD_ID
          },
          auth: {
            username: process.env.ELASTICSEARCH_USERNAME,
            password: process.env.ELASTICSEARCH_PASSWORD
          }
        });
        console.log('🔧 Elasticsearch configured with username/password');
      } else {
        console.error('❌ Elasticsearch Cloud ID provided but missing authentication credentials');
        throw new Error('Missing Elasticsearch authentication: Please set either ELASTICSEARCH_API_KEY or both ELASTICSEARCH_USERNAME and ELASTICSEARCH_PASSWORD');
      }
    } else if (process.env.ELASTICSEARCH_URL) {
      // Use custom URL with auth
      this.client = new Client({
        node: process.env.ELASTICSEARCH_URL,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
          password: process.env.ELASTICSEARCH_PASSWORD || ''
        }
      });
      console.log('🔧 Elasticsearch configured for custom URL');
    } else {
      console.error('❌ No Elasticsearch configuration found');
      console.error('Please set one of the following:');
      console.error('  - ELASTICSEARCH_CLOUD_ID + ELASTICSEARCH_USERNAME + ELASTICSEARCH_PASSWORD');
      console.error('  - ELASTICSEARCH_CLOUD_ID + ELASTICSEARCH_API_KEY');
      console.error('  - ELASTICSEARCH_URL + credentials');
      throw new Error('Missing Elasticsearch configuration: No connection details provided');
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      console.log('✅ Elasticsearch connection successful');
      return true;
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error);
      return false;
    }
  }

  async createIndex(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.INDEX_NAME });
      
      if (!exists) {
        await this.client.indices.create({
          index: this.INDEX_NAME,
          body: {
            mappings: {
              properties: {
                message_id: { type: 'keyword' },
                content: { 
                  type: 'text',
                  analyzer: 'standard',
                  search_analyzer: 'standard'
                },
                author_id: { type: 'keyword' },
                channel_id: { type: 'keyword' },
                guild_id: { type: 'keyword' },
                timestamp: { 
                  type: 'date',
                  format: 'yyyy-MM-dd HH:mm:ss.SSSSSSXXX||yyyy-MM-dd HH:mm:ss.SSSXXX||strict_date_optional_time||epoch_millis'
                },
                // Additional fields for search optimization
                content_length: { type: 'integer' },
                has_content: { type: 'boolean' },
                // For faceted search
                author_name: { type: 'keyword' },
                channel_name: { type: 'keyword' },
                guild_name: { type: 'keyword' }
              }
            },
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
              analysis: {
                analyzer: {
                  discord_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball']
                  }
                }
              }
            }
          }
        });
        console.log(`✅ Created index: ${this.INDEX_NAME}`);
      } else {
        console.log(`📋 Index already exists: ${this.INDEX_NAME}`);
      }
    } catch (error) {
      console.error('❌ Error creating index:', error);
      throw error;
    }
  }

  async indexMessage(message: DiscordMessage): Promise<void> {
    try {
      await this.client.index({
        index: this.INDEX_NAME,
        id: message.message_id,
        body: {
          ...message,
          // Keep original timestamp format - it's already ISO 8601
          content_length: message.content.length,
          has_content: message.content.length > 0
        }
      });
    } catch (error) {
      console.error(`❌ Error indexing message ${message.message_id}:`, error);
      throw error;
    }
  }

  async bulkIndexMessages(messages: DiscordMessage[]): Promise<void> {
    try {
      const body = messages.flatMap(message => [
        { index: { _index: this.INDEX_NAME, _id: message.message_id } },
        {
          ...message,
          // Keep original timestamp format - it's already ISO 8601
          content_length: message.content.length,
          has_content: message.content.length > 0
        }
      ]);

      const response = await this.client.bulk({ body });
      
      if (response.errors) {
        console.error('❌ Bulk indexing errors:', response.items);
        throw new Error('Bulk indexing failed');
      }
      
      console.log(`✅ Bulk indexed ${messages.length} messages`);
    } catch (error) {
      console.error('❌ Error bulk indexing messages:', error);
      throw error;
    }
  }

  async searchMessages(query: {
    content?: string;
    author_id?: string;
    channel_id?: string;
    guild_id?: string;
    from?: number;
    size?: number;
    sort?: 'timestamp' | 'relevance';
  }): Promise<{
    messages: DiscordMessage[];
    total: number;
    took: number;
  }> {
    try {
      const must: any[] = [];
      const filter: any[] = [];

      // Content search with fuzzy matching
      if (query.content) {
        must.push({
          multi_match: {
            query: query.content,
            fields: ['content^2'], // Boost content field
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      }

      // Exact filters
      if (query.author_id) {
        filter.push({ term: { author_id: query.author_id } });
      }
      if (query.channel_id) {
        filter.push({ term: { channel_id: query.channel_id } });
      }
      if (query.guild_id) {
        filter.push({ term: { guild_id: query.guild_id } });
      }

      const sortOrder = query.sort === 'relevance' ? '_score' : { timestamp: { order: 'desc' } };

      const searchBody = {
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter: filter.length > 0 ? filter : undefined
          }
        },
        sort: [sortOrder],
        from: query.from || 0,
        size: query.size || 50,
        highlight: {
          fields: {
            content: {
              fragment_size: 150,
              number_of_fragments: 1
            }
          }
        }
      };

      const response = await this.client.search({
        index: this.INDEX_NAMES,
        body: searchBody
      });

      const messages = response.hits.hits.map((hit: any) => ({
        ...hit._source,
        // Include highlight if available
        _highlight: hit.highlight
      }));

      return {
        messages,
        total: response.hits.total.value,
        took: response.took
      };
    } catch (error) {
      console.error('❌ Error searching messages:', error);
      throw error;
    }
  }

  async getMessageStats(): Promise<{
    total_messages: number;
    unique_authors: number;
    unique_channels: number;
    unique_guilds: number;
  }> {
    try {
      const response = await this.client.search({
        index: this.INDEX_NAMES,
        body: {
          size: 0,
          aggs: {
            total_messages: { value_count: { field: 'message_id' } },
            unique_authors: { cardinality: { field: 'author_id' } },
            unique_channels: { cardinality: { field: 'channel_id' } },
            unique_guilds: { cardinality: { field: 'guild_id' } }
          }
        }
      });

      return {
        total_messages: response.aggregations.total_messages.value,
        unique_authors: response.aggregations.unique_authors.value,
        unique_channels: response.aggregations.unique_channels.value,
        unique_guilds: response.aggregations.unique_guilds.value
      };
    } catch (error) {
      console.error('❌ Error getting message stats:', error);
      throw error;
    }
  }

  async deleteIndex(): Promise<void> {
    try {
      await this.client.indices.delete({ index: this.INDEX_NAME });
      console.log(`✅ Deleted index: ${this.INDEX_NAME}`);
    } catch (error) {
      console.error('❌ Error deleting index:', error);
      throw error;
    }
  }
}

export const elasticsearchService = new ElasticsearchService();