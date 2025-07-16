import React, { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';
import { DiscordChannel } from '../types';
import { useDiscordData } from '../hooks/useDiscordData';

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
  const { fetchChannel, getChannel, isChannelLoading } = useDiscordData();
  const [channel, setChannel] = useState<DiscordChannel | null>(null);

  useEffect(() => {
    const loadChannel = async () => {
      const cachedChannel = getChannel(channelId);
      if (cachedChannel) {
        setChannel(cachedChannel);
      } else {
        const fetchedChannel = await fetchChannel(channelId);
        if (fetchedChannel) {
          setChannel(fetchedChannel);
        }
      }
    };

    loadChannel();
  }, [channelId, fetchChannel, getChannel]);

  const displayName = channel?.name || `channel-${channelId.slice(-4)}`;

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:text-green-600 dark:hover:text-green-400' : ''} transition-colors duration-200`}
      onClick={onClick}
    >
      <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
      
      {showName && (
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          {isChannelLoading(channelId) ? (
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