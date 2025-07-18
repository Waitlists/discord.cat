import { useState, useCallback } from 'react';
import { DiscordUser, DiscordGuild, DiscordChannel, UserCache, GuildCache, ChannelCache } from '@shared/schema';
import { fetchDiscordUser, fetchDiscordGuild, fetchDiscordChannel, rateLimiter } from '../services/discordApi';

export const useDiscordData = () => {
  const [userCache, setUserCache] = useState<UserCache>({});
  const [guildCache, setGuildCache] = useState<GuildCache>({});
  const [channelCache, setChannelCache] = useState<ChannelCache>({});
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  const [loadingGuilds, setLoadingGuilds] = useState<Set<string>>(new Set());
  const [loadingChannels, setLoadingChannels] = useState<Set<string>>(new Set());

  const fetchUser = useCallback(async (userId: string, guildId?: string): Promise<DiscordUser | null> => {
    if (userCache[userId]) return userCache[userId];
    if (loadingUsers.has(userId)) return null;
    
    // Check rate limiting
    if (!rateLimiter.canMakeRequest()) {
      console.warn('Rate limited - waiting before fetching user');
      return null;
    }

    setLoadingUsers(prev => new Set(prev).add(userId));

    try {
      const userData = await fetchDiscordUser(userId, guildId);
      if (userData) {
        const user: DiscordUser = {
          id: userData.id,
          username: userData.username,
          discriminator: userData.discriminator,
          avatar: userData.avatar,
          global_name: userData.global_name,
        };

        setUserCache(prev => ({ ...prev, [userId]: user }));
        return user;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }

    return null;
  }, [userCache, loadingUsers]);

  const fetchGuild = useCallback(async (guildId: string): Promise<DiscordGuild | null> => {
    if (guildCache[guildId]) return guildCache[guildId];
    if (loadingGuilds.has(guildId)) return null;

    if (!rateLimiter.canMakeRequest()) {
      return null;
    }

    setLoadingGuilds(prev => new Set(prev).add(guildId));

    try {
      const guildData = await fetchDiscordGuild(guildId);
      if (guildData) {
        const guild: DiscordGuild = {
          id: guildData.id,
          name: guildData.name,
          icon: guildData.icon,
          description: guildData.description,
        };

        setGuildCache(prev => ({ ...prev, [guildId]: guild }));
        return guild;
      }
    } catch (error) {
      console.error('Error fetching guild:', error);
    } finally {
      setLoadingGuilds(prev => {
        const newSet = new Set(prev);
        newSet.delete(guildId);
        return newSet;
      });
    }

    return null;
  }, [guildCache, loadingGuilds]);

  const fetchChannel = useCallback(async (channelId: string): Promise<DiscordChannel | null> => {
    if (channelCache[channelId]) return channelCache[channelId];
    if (loadingChannels.has(channelId)) return null;

    setLoadingChannels(prev => new Set(prev).add(channelId));

    try {
      const channelData = await fetchDiscordChannel(channelId);
      if (channelData) {
        const channel: DiscordChannel = {
          id: channelData.id,
          name: channelData.name,
          type: channelData.type,
          guild_id: channelData.guild_id,
        };

        setChannelCache(prev => ({ ...prev, [channelId]: channel }));
        return channel;
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setLoadingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }

    return null;
  }, [channelCache, loadingChannels]);

  return {
    // Fetch functions
    fetchUser,
    fetchGuild,
    fetchChannel,
    
    // Cache getters
    getUser: useCallback((userId: string) => userCache[userId] || null, [userCache]),
    getGuild: useCallback((guildId: string) => guildCache[guildId] || null, [guildCache]),
    getChannel: useCallback((channelId: string) => channelCache[channelId] || null, [channelCache]),
    
    // Loading states
    isUserLoading: useCallback((userId: string) => loadingUsers.has(userId), [loadingUsers]),
    isGuildLoading: useCallback((guildId: string) => loadingGuilds.has(guildId), [loadingGuilds]),
    isChannelLoading: useCallback((channelId: string) => loadingChannels.has(channelId), [loadingChannels]),
  };
};