export interface DiscordMessage {
  message_id: string;
  content: string;
  author_id: string;
  channel_id: string;
  guild_id: string;
  timestamp: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  description?: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
}

export interface MessageStats {
  totalMessages: number;
  uniqueServers: number;
  uniqueUsers: number;
}

export interface SearchFilters {
  content: string;
  authorId: string;
  channelId: string;
  guildId: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name?: string;
}

export interface UserCache {
  [userId: string]: DiscordUser;
}

export interface GuildCache {
  [guildId: string]: DiscordGuild;
}

export interface ChannelCache {
  [channelId: string]: DiscordChannel;
}