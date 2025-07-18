// discordService.ts

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_CDN = 'https://cdn.discordapp.com';

export const fetchUserFromPublicAPI = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/users/${userId}`, {
      headers: {
        'User-Agent': 'DiscordBot (https://discord.cat, 1.0.0)',
      },
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.debug('Public API failed for user', userId);
  }
  return null;
};

export const fetchUserFromWidget = async (userId: string, guildId?: string): Promise<any> => {
  if (!guildId) return null;
  try {
    const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/widget.json`);
    if (response.ok) {
      const widget = await response.json();
      const member = widget.members?.find((m: any) => m.id === userId);
      if (member) {
        return {
          id: userId,
          username: member.username,
          discriminator: member.discriminator || '0000',
          avatar: member.avatar,
          global_name: member.nick || member.username,
        };
      }
    }
  } catch (error) {
    console.debug('Widget API failed for user', userId);
  }
  return null;
};

export const fetchUserFromEmbeds = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(`https://discordapp.com/api/users/${userId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.debug('Embed API failed for user', userId);
  }
  return null;
};

export const generateFallbackUser = (userId: string): any => {
  const userIdNum = parseInt(userId.slice(-8), 16) || 1;
  const adjectives = ['Cool', 'Epic', 'Swift', 'Bright', 'Bold', 'Quick', 'Smart', 'Wild'];
  const nouns = ['Gamer', 'Coder', 'Artist', 'Ninja', 'Wizard', 'Hunter', 'Knight', 'Sage'];
  const adjective = adjectives[userIdNum % adjectives.length];
  const noun = nouns[(userIdNum >> 3) % nouns.length];
  const number = (userIdNum % 9999).toString().padStart(4, '0');
  return {
    id: userId,
    username: `${adjective}${noun}${number}`,
    discriminator: '0000',
    avatar: null,
    global_name: `${adjective} ${noun}`,
  };
};

export const fetchDiscordUser = async (userId: string, guildId?: string): Promise<any> => {
  let userData = null;
  userData = await fetchUserFromPublicAPI(userId);
  if (userData) return userData;
  if (guildId) {
    userData = await fetchUserFromWidget(userId, guildId);
    if (userData) return userData;
  }
  userData = await fetchUserFromEmbeds(userId);
  if (userData) return userData;
  return generateFallbackUser(userId);
};

export const getAvatarUrl = (userId: string, avatarHash: string | null, size: number = 128): string => {
  if (avatarHash) {
    const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${DISCORD_CDN}/avatars/${userId}/${avatarHash}.${extension}?size=${size}`;
  }
  const defaultAvatarIndex = (parseInt(userId) >> 22) % 6;
  return `${DISCORD_CDN}/embed/avatars/${defaultAvatarIndex}.png`;
};

export const fetchDiscordGuild = async (guildId: string): Promise<any> => {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/widget.json`);
    if (response.ok) {
      const widget = await response.json();
      return {
        id: guildId,
        name: widget.name,
        icon: widget.instant_invite ? extractIconFromInvite(widget.instant_invite) : null,
      };
    }
  } catch (error) {
    console.debug('Guild fetch failed:', error);
  }
  return {
    id: guildId,
    name: `Server ${guildId.slice(-4)}`,
    icon: null,
  };
};

const extractIconFromInvite = (inviteUrl: string): string | null => {
  try {
    return null;
  } catch {
    return null;
  }
};

export const fetchDiscordChannel = async (channelId: string): Promise<any> => {
  return {
    id: channelId,
    name: `channel-${channelId.slice(-4)}`,
    type: 0,
  };
};

export const getGuildIconUrl = (guildId: string, iconHash: string | null, size: number = 64): string => {
  if (iconHash) {
    const extension = iconHash.startsWith('a_') ? 'gif' : 'png';
    return `${DISCORD_CDN}/icons/${guildId}/${iconHash}.${extension}?size=${size}`;
  }
  return '';
};

export const isValidSnowflake = (id: string): boolean => {
  return /^\d{17,20}$/.test(id);
};

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 50;
  private readonly timeWindow = 1000;
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
}

export const rateLimiter = new RateLimiter();
