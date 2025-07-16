import React, { useEffect, useState } from 'react';
import { Server } from 'lucide-react';
import { DiscordGuild } from '../types';
import { useDiscordData } from '../hooks/useDiscordData';
import { getGuildIconUrl } from '../services/discordApi';

interface GuildInfoProps {
  guildId: string;
  showName?: boolean;
  onClick?: () => void;
}

const GuildInfo: React.FC<GuildInfoProps> = ({ 
  guildId, 
  showName = true,
  onClick 
}) => {
  const { fetchGuild, getGuild, isGuildLoading } = useDiscordData();
  const [guild, setGuild] = useState<DiscordGuild | null>(null);

  useEffect(() => {
    const loadGuild = async () => {
      const cachedGuild = getGuild(guildId);
      if (cachedGuild) {
        setGuild(cachedGuild);
      } else {
        const fetchedGuild = await fetchGuild(guildId);
        if (fetchedGuild) {
          setGuild(fetchedGuild);
        }
      }
    };

    loadGuild();
  }, [guildId, fetchGuild, getGuild]);

  const iconUrl = guild?.icon ? getGuildIconUrl(guildId, guild.icon) : null;
  const displayName = guild?.name || `Server ${guildId.slice(-4)}`;

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:text-purple-600 dark:hover:text-purple-400' : ''} transition-colors duration-200`}
      onClick={onClick}
    >
      <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center overflow-hidden">
        {isGuildLoading(guildId) ? (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ) : iconUrl ? (
          <img
            src={iconUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Server className="w-3 h-3 text-white" />
        )}
      </div>
      
      {showName && (
        <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
          {displayName}
        </span>
      )}
    </div>
  );
};

export default GuildInfo;