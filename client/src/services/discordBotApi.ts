// Discord Bot API service - Backend proxy version
// This service communicates with our backend server instead of Discord directly

const API_BASE_URL = 'http://localhost:3001/api';

export interface DiscordApiUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
  avatar_url: string;
  banner?: string | null;
  accent_color?: number | null;
  public_flags?: number;
  flags?: number;
  banner_color?: string | null;
  avatar_decoration_data?: any;
  clan?: {
    identity_guild_id: string;
    identity_enabled: boolean;
    tag: string;
    badge: string;
  };
  primary_guild?: {
    identity_guild_id: string;
    identity_enabled: boolean;
    tag: string;
    badge: string;
  };
  cached?: boolean;
}

export interface DiscordApiGuild {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  member_count?: number;
  presence_count?: number;
  cached?: boolean;
}

export interface DiscordApiChannel {
  id: string;
  name: string;
  type: number;
  guild_id?: string | null;
  topic?: string | null;
  position?: number;
  cached?: boolean;
}

class DiscordBotService {
  private cache = new Map<string, { user: DiscordApiUser; timestamp: number }>();
  private guildCache = new Map<string, { guild: DiscordApiGuild; timestamp: number }>();
  private channelCache = new Map<string, { channel: DiscordApiChannel; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private pendingRequests = new Map<string, Promise<DiscordApiUser | null>>();
  private pendingGuildRequests = new Map<string, Promise<DiscordApiGuild | null>>();
  private pendingChannelRequests = new Map<string, Promise<DiscordApiChannel | null>>();

  constructor() {
    console.log('🔧 Discord service initialized (backend proxy mode)');
    console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  }

  async fetchUser(userId: string, size: number = 128): Promise<DiscordApiUser | null> {
    console.log(`👤 Fetching user data for ID: ${userId}`);
    
    // Check cache first
    const cached = this.getCachedUser(userId);
    if (cached) {
      console.log('💾 Using cached user data');
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(userId)) {
      console.log('⏳ Request already pending, waiting...');
      return this.pendingRequests.get(userId)!;
    }

    // Create new request
    const requestPromise = this.makeUserRequest(userId, size);
    this.pendingRequests.set(userId, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(userId);
    }
  }

  private async makeUserRequest(userId: string, size: number): Promise<DiscordApiUser | null> {
    try {
      console.log(`🌐 Making backend request for user: ${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/discord/users/${userId}?size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Backend request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 404) {
          console.log('👻 User not found');
          return null;
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const userData: DiscordApiUser = await response.json();
      console.log(`✅ Successfully fetched user:`, {
        id: userData.id,
        username: userData.username,
        global_name: userData.global_name,
        hasAvatar: !!userData.avatar,
        cached: userData.cached
      });

      // Cache the result
      this.cache.set(userId, {
        user: userData,
        timestamp: Date.now()
      });

      return userData;

    } catch (error) {
      console.error(`❌ Failed to fetch user ${userId}:`, error);
      return null;
    }
  }

  async fetchUsers(userIds: string[], size: number = 128): Promise<Record<string, DiscordApiUser | null>> {
    console.log(`👥 Batch fetching ${userIds.length} users`);
    
    const results: Record<string, DiscordApiUser | null> = {};
    const uncachedIds: string[] = [];

    // Check cache for each user
    for (const userId of userIds) {
      const cached = this.getCachedUser(userId);
      if (cached) {
        results[userId] = cached;
      } else {
        uncachedIds.push(userId);
      }
    }

    if (uncachedIds.length === 0) {
      console.log('💾 All users found in cache');
      return results;
    }

    try {
      console.log(`🌐 Making batch request for ${uncachedIds.length} uncached users`);
      
      const response = await fetch(`${API_BASE_URL}/discord/users/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: uncachedIds,
          size
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Batch request failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const batchData = await response.json();
      console.log(`✅ Batch request successful: ${batchData.successful}/${batchData.total} users`);

      // Process batch results
      for (const [userId, userData] of Object.entries(batchData.users)) {
        if (userData && !userData.error) {
          // Cache successful results
          this.cache.set(userId, {
            user: userData as DiscordApiUser,
            timestamp: Date.now()
          });
          results[userId] = userData as DiscordApiUser;
        } else {
          console.warn(`⚠️ Failed to fetch user ${userId}:`, userData.error);
          results[userId] = null;
        }
      }

    } catch (error) {
      console.error('❌ Batch request error:', error);
      // Return null for all uncached users on error
      for (const userId of uncachedIds) {
        results[userId] = null;
      }
    }

    return results;
  }

  async fetchGuild(guildId: string): Promise<DiscordApiGuild | null> {
    console.log(`🏰 Fetching guild data for ID: ${guildId}`);
    
    // Check cache first
    const cached = this.getCachedGuild(guildId);
    if (cached) {
      console.log('💾 Using cached guild data');
      return cached;
    }

    // Check if request is already pending
    if (this.pendingGuildRequests.has(guildId)) {
      console.log('⏳ Guild request already pending, waiting...');
      return this.pendingGuildRequests.get(guildId)!;
    }

    // Create new request
    const requestPromise = this.makeGuildRequest(guildId);
    this.pendingGuildRequests.set(guildId, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingGuildRequests.delete(guildId);
    }
  }

  private async makeGuildRequest(guildId: string): Promise<DiscordApiGuild | null> {
    try {
      console.log(`🌐 Making backend request for guild: ${guildId}`);
      
      const response = await fetch(`${API_BASE_URL}/discord/guilds/${guildId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Backend guild request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 404) {
          console.log('👻 Guild not found');
          return null;
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const guildData: DiscordApiGuild = await response.json();
      console.log(`✅ Successfully fetched guild:`, {
        id: guildData.id,
        name: guildData.name,
        cached: guildData.cached
      });

      // Cache the result
      this.guildCache.set(guildId, {
        guild: guildData,
        timestamp: Date.now()
      });

      return guildData;

    } catch (error) {
      console.error(`❌ Failed to fetch guild ${guildId}:`, error);
      return null;
    }
  }

  async fetchChannel(channelId: string): Promise<DiscordApiChannel | null> {
    console.log(`📺 Fetching channel data for ID: ${channelId}`);
    
    // Check cache first
    const cached = this.getCachedChannel(channelId);
    if (cached) {
      console.log('💾 Using cached channel data');
      return cached;
    }

    // Check if request is already pending
    if (this.pendingChannelRequests.has(channelId)) {
      console.log('⏳ Channel request already pending, waiting...');
      return this.pendingChannelRequests.get(channelId)!;
    }

    // Create new request
    const requestPromise = this.makeChannelRequest(channelId);
    this.pendingChannelRequests.set(channelId, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingChannelRequests.delete(channelId);
    }
  }

  private async makeChannelRequest(channelId: string): Promise<DiscordApiChannel | null> {
    try {
      console.log(`🌐 Making backend request for channel: ${channelId}`);
      
      const response = await fetch(`${API_BASE_URL}/discord/channels/${channelId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Backend channel request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 404) {
          console.log('👻 Channel not found');
          return null;
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const channelData: DiscordApiChannel = await response.json();
      console.log(`✅ Successfully fetched channel:`, {
        id: channelData.id,
        name: channelData.name,
        cached: channelData.cached
      });

      // Cache the result
      this.channelCache.set(channelId, {
        channel: channelData,
        timestamp: Date.now()
      });

      return channelData;

    } catch (error) {
      console.error(`❌ Failed to fetch channel ${channelId}:`, error);
      return null;
    }
  }

  private getCachedUser(userId: string): DiscordApiUser | null {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.user;
    }
    
    if (cached) {
      this.cache.delete(userId); // Remove expired cache
    }
    
    return null;
  }

  private getCachedGuild(guildId: string): DiscordApiGuild | null {
    const cached = this.guildCache.get(guildId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.guild;
    }
    
    if (cached) {
      this.guildCache.delete(guildId); // Remove expired cache
    }
    
    return null;
  }

  private getCachedChannel(channelId: string): DiscordApiChannel | null {
    const cached = this.channelCache.get(channelId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.channel;
    }
    
    if (cached) {
      this.channelCache.delete(channelId); // Remove expired cache
    }
    
    return null;
  }

  getDisplayName(user: DiscordApiUser): string {
    const displayName = user.global_name || user.username;
    console.log(`📝 Display name for ${user.id}: ${displayName}`);
    return displayName;
  }

  getFullUsername(user: DiscordApiUser): string {
    const fullUsername = user.discriminator === '0' 
      ? `@${user.username}` 
      : `${user.username}#${user.discriminator}`;
    console.log(`📝 Full username for ${user.id}: ${fullUsername}`);
    return fullUsername;
  }

  getAvatarUrl(user: DiscordApiUser, size?: number): string {
    // Use the avatar_url provided by the backend, or fallback to user.avatar_url
    return user.avatar_url;
  }

  // Clear cache (useful for testing or memory management)
  clearCache(): void {
    this.cache.clear();
    this.guildCache.clear();
    this.channelCache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache stats
  getCacheStats(): { 
    userCacheSize: number; 
    guildCacheSize: number; 
    channelCacheSize: number; 
    users: string[];
    guilds: string[];
    channels: string[];
  } {
    return {
      userCacheSize: this.cache.size,
      guildCacheSize: this.guildCache.size,
      channelCacheSize: this.channelCache.size,
      users: Array.from(this.cache.keys()),
      guilds: Array.from(this.guildCache.keys()),
      channels: Array.from(this.channelCache.keys()),
    };
  }

  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const health = await response.json();
      console.log('🏥 Backend health:', health);
      return response.ok && health.status === 'healthy';
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const discordBotService = new DiscordBotService();