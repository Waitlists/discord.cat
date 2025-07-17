import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useDiscordUser } from '../hooks/useDiscordUser';
import { discordBotService } from '../services/discordBotApi';

interface DiscordUserCardProps {
  userId: string;
  onClose?: () => void;
}

const DiscordUserCard: React.FC<DiscordUserCardProps> = ({ userId, onClose }) => {
  const { user, loading, error } = useDiscordUser(userId);
  const [copied, setCopied] = React.useState(false);

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load user</div>
          <div className="text-sm text-gray-500">{error || 'Unknown error'}</div>
        </div>
      </div>
    );
  }

  const avatarUrl = discordBotService.getAvatarUrl(user.id, user.avatar, 128);
  const displayName = discordBotService.getDisplayName(user);
  const fullUsername = discordBotService.getFullUsername(user);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-gray-300 dark:bg-gray-600">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = discordBotService.getAvatarUrl(user.id, null);
            }}
          />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {displayName}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {fullUsername}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>ID: {userId}</span>
          <button
            onClick={copyUserId}
            className="p-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => window.open(`https://discord.com/users/${userId}`, '_blank')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Profile
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscordUserCard;