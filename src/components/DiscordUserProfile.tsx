import React from 'react';
import { User, AlertCircle, Loader2 } from 'lucide-react';
import { useDiscordUser } from '../hooks/useDiscordUser';
import { discordBotService } from '../services/discordBotApi';

interface DiscordUserProfileProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
  showFullUsername?: boolean;
  onClick?: () => void;
  className?: string;
}

const DiscordUserProfile: React.FC<DiscordUserProfileProps> = ({
  userId,
  size = 'md',
  showUsername = true,
  showFullUsername = false,
  onClick,
  className = '',
}) => {
  const { user, loading, error } = useDiscordUser(userId);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
          <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
        </div>
        {showUsername && (
          <div className="flex flex-col gap-1">
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            {showFullUsername && (
              <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            )}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center`}>
          <AlertCircle className={`${iconSizes[size]} text-red-500`} />
        </div>
        {showUsername && (
          <div className="flex flex-col">
            <span className={`${textSizes[size]} text-red-600 dark:text-red-400 font-medium`}>
              Error loading user
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: {userId.slice(0, 8)}...
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center`}>
          <User className={`${iconSizes[size]} text-gray-500 dark:text-gray-400`} />
        </div>
        {showUsername && (
          <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>
            Unknown User
          </span>
        )}
      </div>
    );
  }

  const avatarUrl = discordBotService.getAvatarUrl(user.id, user.avatar, size === 'lg' ? 128 : size === 'md' ? 64 : 32);
  const displayName = discordBotService.getDisplayName(user);
  const fullUsername = discordBotService.getFullUsername(user);

  return (
    <div 
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex items-center justify-center`}>
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar on error
            const target = e.target as HTMLImageElement;
            target.src = discordBotService.getAvatarUrl(user.id, null);
          }}
        />
      </div>
      
      {showUsername && (
        <div className="flex flex-col min-w-0">
          <span className={`${textSizes[size]} font-semibold text-gray-900 dark:text-white truncate`}>
            {displayName}
          </span>
          {showFullUsername && (
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {fullUsername}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscordUserProfile;