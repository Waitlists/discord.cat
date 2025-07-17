import { useState, useEffect, useCallback } from 'react';
import { discordBotService, DiscordApiUser } from '../services/discordBotApi';

interface UseDiscordUserResult {
  user: DiscordApiUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDiscordUser = (userId: string): UseDiscordUserResult => {
  const [user, setUser] = useState<DiscordApiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userData = await discordBotService.fetchUser(userId);
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      console.error('Error fetching Discord user:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Only depend on userId

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetch = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch };
};

// Hook for multiple users
export const useDiscordUsers = (userIds: string[]) => {
  const [users, setUsers] = useState<Record<string, DiscordApiUser>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchUser = useCallback(async (userId: string) => {
    if (!userId || users[userId]) return;

    setLoading(prev => ({ ...prev, [userId]: true }));
    setErrors(prev => ({ ...prev, [userId]: '' }));

    try {
      const userData = await discordBotService.fetchUser(userId);
      if (userData) {
        setUsers(prev => ({ ...prev, [userId]: userData }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setErrors(prev => ({ ...prev, [userId]: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [users]);

  useEffect(() => {
    userIds.forEach(userId => {
      if (userId && !users[userId] && !loading[userId]) {
        fetchUser(userId);
      }
    });
  }, [userIds, users, loading, fetchUser]);

  return { users, loading, errors };
};