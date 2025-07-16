import React from 'react';
import { Clock, Copy, Hash, Server } from 'lucide-react';
import { DiscordMessage } from '../types';
import UserAvatar from './UserAvatar';
import Pagination from './Pagination';

interface MessageDisplayProps {
  messages: DiscordMessage[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  onAuthorClick: (authorId: string) => void;
  onChannelClick: (channelId: string) => void;
  onGuildClick: (guildId: string) => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({
  messages,
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  onAuthorClick,
  onChannelClick,
  onGuildClick,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-900 dark:text-white text-2xl font-bold mb-4">
          No messages found
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Try adjusting your search criteria to find messages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          Search Results
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalResults.toLocaleString()} total messages found
        </div>
      </div>

      <div className="space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.message_id}
            className="group border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <UserAvatar 
                  userId={message.author_id}
                  guildId={message.guild_id}
                  size="md"
                  showUsername={true}
                  onClick={() => onAuthorClick(message.author_id)}
                />
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => copyToClipboard(message.content)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-4 ml-14">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                {message.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 ml-14">
              <button
                onClick={() => onChannelClick(message.channel_id)}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
              >
                <Hash className="w-3 h-3" />
                {message.channel_id}
              </button>

              <button
                onClick={() => onGuildClick(message.guild_id)}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-200"
              >
                <Server className="w-3 h-3" />
                {message.guild_id}
              </button>

              <span className="inline-flex items-center gap-2 px-3 py-1 text-gray-600 dark:text-gray-400 text-sm">
                User ID: {message.author_id}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        resultsPerPage={50}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default MessageDisplay;