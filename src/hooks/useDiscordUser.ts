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
    if (!userId) {
      setUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await discordBotService.fetchUser(userId);
      setUser(userData);
      
      if (!userData) {
        setError('User not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      console.error('Error fetching Discord user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetch = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch };
};

// Hook for multiple users with batch fetching
export const useDiscordUsers = (userIds: string[]) => {
  const [users, setUsers] = useState<Record<string, DiscordApiUser | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchUsers = useCallback(async () => {
    if (userIds.length === 0) return;

    // Set loading state for all users
    const loadingState: Record<string, boolean> = {};
    userIds.forEach(id => {
      loadingState[id] = true;
    });
    setLoading(loadingState);

    try {
      const results = await discordBotService.fetchUsers(userIds);
      
      setUsers(prev => ({ ...prev, ...results }));
      
      // Update loading and error states
      const newLoading: Record<string, boolean> = {};
      const newErrors: Record<string, string> = {};
      
      userIds.forEach(id => {
        newLoading[id] = false;
        if (!results[id]) {
          newErrors[id] = 'User not found';
        } else {
          newErrors[id] = '';
        }
      });
      
      setLoading(newLoading);
      setErrors(newErrors);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      
      // Set error for all users
      const newLoading: Record<string, boolean> = {};
      const newErrors: Record<string, string> = {};
      
      userIds.forEach(id => {
        newLoading[id] = false;
        newErrors[id] = errorMessage;
      });
      
      setLoading(newLoading);
      setErrors(newErrors);
    }
  }, [userIds]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, errors, refetch: fetchUsers };
};