import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { DiscordUser } from '../types';
import { useDiscordData } from '../hooks/useDiscordData';
import { getAvatarUrl } from '../services/discordApi';

interface UserAvatarProps {
  userId: string;
  guildId?: string;
  size?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  guildId,
  size = 'md', 
  showUsername = false,
  onClick 
}) => {
  const { fetchUser, getUser, isUserLoading } = useDiscordData();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  useEffect(() => {
    const loadUser = async () => {
      const cachedUser = getUser(userId);
      if (cachedUser) {
        setUser(cachedUser);
      } else {
        const fetchedUser = await fetchUser(userId, guildId);
        if (fetchedUser) {
          setUser(fetchedUser);
        }
      }
    };

    loadUser();
  }, [userId, guildId, fetchUser, getUser]);

  const avatarUrl = user?.avatar && !imageError ? getAvatarUrl(userId, user.avatar, 128) : getAvatarUrl(userId, null, 128);
  const displayName = user?.global_name || user?.username || `User ${userId.slice(-4)}`;
  const username = user?.username || `user${userId.slice(-4)}`;

  return (
    <div 
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}
      onClick={onClick}
    >
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden relative`}>
        {isUserLoading(userId) ? (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ) : (
          <>
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
            {imageError && (
              <User className={`${iconSizes[size]} text-gray-500 dark:text-gray-400 absolute inset-0 m-auto`} />
            )}
          </>
        )}
      </div>
      
      {showUsername && (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-900 dark:text-white truncate">
            {isUserLoading(userId) ? (
              <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              displayName
            )}
          </span>
          {user?.username && user.username !== displayName && !isUserLoading(userId) && (
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              @{username}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;