import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Discord-specific types for the message viewer
export interface DiscordMessage {
  message_id: string;
  content: string;
  author_id: string;
  channel_id: string;
  guild_id: string;
  timestamp: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name?: string;
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

export interface UserCache {
  [userId: string]: DiscordUser;
}

export interface GuildCache {
  [guildId: string]: DiscordGuild;
}

export interface ChannelCache {
  [channelId: string]: DiscordChannel;
}

// Database schema for potential future persistence
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
