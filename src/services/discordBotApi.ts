// Discord Bot API service for fetching real user data
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_CDN = 'https://cdn.discordapp.com';

interface DiscordApiUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

interface DiscordApiError {
  message: string;
  code: number;
}

class DiscordBotService {
  private botToken: string | null = null;
  private cache = new Map<string, DiscordApiUser>();
  private rateLimitReset = 0;
  private rateLimitRemaining = 50;

  constructor() {
    this.botToken = import.meta.env.VITE_DISCORD_BOT_TOKEN;
    if (!this.botToken || this.botToken === 'your_discord_bot_token_here') {
      console.warn('Discord bot token not configured. User data fetching will use fallbacks.');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.botToken || this.botToken === 'your_discord_bot_token_here') {
      throw new Error('Discord bot token not configured');
    }

    // Check rate limiting
    if (this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitReset) {
      const waitTime = this.rateLimitReset - Date.now();
      console.warn(`Rate limited. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bot ${this.botToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBot (https://discord.cat, 1.0.0)',
      },
    });

    // Update rate limit info
    this.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '50');
    this.rateLimitReset = parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000;

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      } else if (response.status === 401) {
        throw new Error('Invalid bot token');
      } else if (response.status === 403) {
        throw new Error('Bot lacks permissions');
      } else if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1') * 1000;
        throw new Error(`Rate limited. Retry after ${retryAfter}ms`);
      }
      
      const errorData: DiscordApiError = await response.json().catch(() => ({ 
        message: 'Unknown error', 
        code: response.status 
      }));
      throw new Error(`Discord API Error: ${errorData.message} (${errorData.code})`);
    }

    return response.json();
  }

  async fetchUser(userId: string): Promise<DiscordApiUser | null> {
    // Check cache first
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    try {
      const userData = await this.makeRequest(`/users/${userId}`);
      
      // Cache the result
      this.cache.set(userId, userData);
      
      return userData;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      
      // Return fallback data
      return this.generateFallbackUser(userId);
    }
  }

  private generateFallbackUser(userId: string): DiscordApiUser {
    // Generate consistent fallback data based on user ID
    const userIdNum = parseInt(userId.slice(-8), 16) || 1;
    
    const adjectives = ['Cool', 'Epic', 'Swift', 'Bright', 'Bold', 'Quick', 'Smart', 'Wild', 'Brave', 'Calm'];
    const nouns = ['Gamer', 'Coder', 'Artist', 'Ninja', 'Wizard', 'Hunter', 'Knight', 'Sage', 'Mage', 'Hero'];
    
    const adjective = adjectives[userIdNum % adjectives.length];
    const noun = nouns[(userIdNum >> 3) % nouns.length];
    const number = (userIdNum % 9999).toString().padStart(4, '0');
    
    return {
      id: userId,
      username: `${adjective}${noun}${number}`,
      discriminator: '0',
      global_name: `${adjective} ${noun}`,
      avatar: null,
    };
  }

  getAvatarUrl(userId: string, avatarHash: string | null | undefined, size: number = 128): string {
    if (avatarHash) {
      // Determine if it's a GIF or static image
      const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
      return `${DISCORD_CDN}/avatars/${userId}/${avatarHash}.${extension}?size=${size}`;
    }
    
    // Generate default avatar based on Discord's algorithm
    // For new usernames (discriminator 0), use user ID
    // For legacy usernames, use discriminator
    const defaultAvatarIndex = (parseInt(userId) >> 22) % 6;
    return `${DISCORD_CDN}/embed/avatars/${defaultAvatarIndex}.png`;
  }

  getDisplayName(user: DiscordApiUser): string {
    return user.global_name || user.username;
  }

  getFullUsername(user: DiscordApiUser): string {
    if (user.discriminator === '0') {
      return `@${user.username}`;
    }
    return `${user.username}#${user.discriminator}`;
  }

  // Clear cache (useful for testing or memory management)
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; users: string[] } {
    return {
      size: this.cache.size,
      users: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const discordBotService = new DiscordBotService();

// Export types
export type { DiscordApiUser };