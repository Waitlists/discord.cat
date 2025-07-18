import React, { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';
import { discordBotService, DiscordApiChannel } from '../services/discordBotApi';

interface ChannelInfoProps {
  channelId: string;
  showName?: boolean;
  onClick?: () => void;
}

const ChannelInfo: React.FC<ChannelInfoProps> = ({ 
  channelId, 
  showName = true,
  onClick 
}) => {
  const [channel, setChannel] = useState<DiscordApiChannel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChannel = async () => {
      setLoading(true);
      try {
        const channelData = await discordBotService.fetchChannel(channelId);
        setChannel(channelData);
      } catch (error) {
        console.error('Error loading channel:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
  }, [channelId]);

  const displayName = channel?.name || `channel-${channelId.slice(-4)}`;

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:text-green-600 dark:hover:text-green-400' : ''} transition-colors duration-200`}
      onClick={onClick}
    >
      <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
      
      {showName && (
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          {loading ? (
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          ) : (
            displayName
          )}
        </span>
      )}
    </div>
  );
};

export default ChannelInfo;