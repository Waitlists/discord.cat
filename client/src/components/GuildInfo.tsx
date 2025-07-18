import React, { useEffect, useState } from 'react';
import { Server } from 'lucide-react';
import { discordBotService, DiscordApiGuild } from '../services/discordBotApi';

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
  const [guild, setGuild] = useState<DiscordApiGuild | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGuild = async () => {
      setLoading(true);
      try {
        const guildData = await discordBotService.fetchGuild(guildId);
        setGuild(guildData);
      } catch (error) {
        console.error('Error loading guild:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGuild();
  }, [guildId]);

  const iconUrl = guild?.icon ? `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png?size=64` : null;
  const displayName = guild?.name || `Server ${guildId.slice(-4)}`;

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:text-purple-600 dark:hover:text-purple-400' : ''} transition-colors duration-200`}
      onClick={onClick}
    >
      <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center overflow-hidden">
        {loading ? (
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