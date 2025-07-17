// Discord Bot API service - Browser-compatible version
// Note: Direct Discord API calls from browser are blocked by CORS
// This service provides fallback functionality with realistic user data

const DISCORD_CDN = 'https://cdn.discordapp.com';

export interface DiscordApiUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
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
}

class DiscordBotService {
  private cache = new Map<string, DiscordApiUser>();

  constructor() {
    console.log('🔧 Discord service initialized (browser-compatible mode)');
    console.log('ℹ️ Note: Direct Discord API calls are blocked by CORS in browsers');
    console.log('ℹ️ Using fallback user data generation');
  }

  async fetchUser(userId: string): Promise<DiscordApiUser | null> {
    console.log(`👤 Fetching user data for ID: ${userId}`);
    
    // Check cache first
    if (this.cache.has(userId)) {
      console.log('💾 Using cached user data');
      return this.cache.get(userId)!;
    }

    // Note: Discord API calls from browser are blocked by CORS
    // In a real application, you would need a backend proxy server
    console.log('🔄 Generating fallback user data (CORS limitation)');
    const fallbackUser = this.generateFallbackUser(userId);
    
    // Cache the result
    this.cache.set(userId, fallbackUser);
    return fallbackUser;
  }

  private generateFallbackUser(userId: string): DiscordApiUser {
    // Generate consistent fallback data based on user ID
    const userIdNum = parseInt(userId.slice(-8), 16) || 1;
    
    const adjectives = ['Cool', 'Epic', 'Swift', 'Bright', 'Bold', 'Quick', 'Smart', 'Wild', 'Brave', 'Calm'];
    const nouns = ['Gamer', 'Coder', 'Artist', 'Ninja', 'Wizard', 'Hunter', 'Knight', 'Sage', 'Mage', 'Hero'];
    
    const adjective = adjectives[userIdNum % adjectives.length];
    const noun = nouns[(userIdNum >> 3) % nouns.length];
    const number = (userIdNum % 9999).toString().padStart(4, '0');
    
    const user: DiscordApiUser = {
      id: userId,
      username: `${adjective}${noun}${number}`,
      discriminator: '0',
      global_name: `${adjective} ${noun}`,
      avatar: null, // Will use default avatar
    };

    console.log('✅ Generated fallback user:', {
      username: user.username,
      global_name: user.global_name,
      avatar: user.avatar
    });

    return user;
  }

  getAvatarUrl(userId: string, avatarHash: string | null | undefined, size: number = 128): string {
    if (avatarHash) {
      // Determine if it's a GIF or static image
      const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
      const url = `${DISCORD_CDN}/avatars/${userId}/${avatarHash}.${extension}?size=${size}`;
      console.log(`🖼️ Generated avatar URL: ${url}`);
      return url;
    }
    
    // Generate default avatar based on Discord's algorithm
    // For new usernames (discriminator 0), use user ID
    const defaultAvatarIndex = (parseInt(userId) >> 22) % 6;
    const url = `${DISCORD_CDN}/embed/avatars/${defaultAvatarIndex}.png`;
    console.log(`🖼️ Generated default avatar URL: ${url}`);
    return url;
  }

  getDisplayName(user: DiscordApiUser): string {
    const displayName = user.global_name || user.username;
    console.log(`📝 Display name for ${user.id}: ${displayName}`);
    return displayName;
  }

  getFullUsername(user: DiscordApiUser): string {
    const fullUsername = user.discriminator === '0' ? `@${user.username}` : `${user.username}#${user.discriminator}`;
    console.log(`📝 Full username for ${user.id}: ${fullUsername}`);
    return fullUsername;
  }

  // Clear cache (useful for testing or memory management)
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
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