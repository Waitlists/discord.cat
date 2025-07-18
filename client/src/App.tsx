import { useState, useMemo } from 'react';
import { DiscordMessage, MessageStats, SearchFilters } from '@shared/schema';
import Logo from './components/Logo';
import ThemeToggle from './components/ThemeToggle';
import StatsBar from './components/StatsBar';
import SearchInterface from './components/SearchInterface';
import MessageDisplay from './components/MessageDisplay';
import DiscordUserCard from './components/DiscordUserCard';
import { useTheme } from './hooks/useTheme';

// Import all message chunks
import messages1 from './data/discord_messages1.json';
import messages2 from './data/discord_messages2.json';
import messages3 from './data/discord_messages3.json';
import messages4 from './data/discord_messages4.json';
import messages5 from './data/discord_messages5.json';
import messages6 from './data/discord_messages6.json';
import messages7 from './data/discord_messages7.json';
import messages8 from './data/discord_messages8.json';
import messages9 from './data/discord_messages9.json';
import messages10 from './data/discord_messages10.json';
import messages11 from './data/discord_messages11.json';
import messages12 from './data/discord_messages12.json';
import messages13 from './data/discord_messages13.json';
import messages14 from './data/discord_messages14.json';
import messages15 from './data/discord_messages15.json';
import messages16 from './data/discord_messages16.json';
import messages17 from './data/discord_messages17.json';
import messages18 from './data/discord_messages18.json';
import messages19 from './data/discord_messages19.json';
import messages20 from './data/discord_messages20.json';
import messages21 from './data/discord_messages21.json';
import messages22 from './data/discord_messages22.json';
import messages23 from './data/discord_messages23.json';
import messages24 from './data/discord_messages24.json'; 
import messages25 from './data/discord_messages25.json';
import messages26 from './data/discord_messages26.json';
import messages27 from './data/discord_messages27.json';
import messages28 from './data/discord_messages28.json'; 
import messages29 from './data/discord_messages29.json';
import messages30 from './data/discord_messages30.json';
import messages31 from './data/discord_messages31.json';

// Combine all message chunks and sort by timestamp (newest first)
const messagesData = [
  ...messages1,
  ...messages2,
  ...messages3,
  ...messages4,
  ...messages5,
  ...messages6,
  ...messages7,
  ...messages8,
  ...messages9,
  ...messages10,
  ...messages11,
  ...messages12,
  ...messages13,
  ...messages14,
  ...messages15,
  ...messages16,
  ...messages17,
  ...messages18,
  ...messages19,
  ...messages20,
  ...messages21,
  ...messages22,
  ...messages23,
  ...messages24,
  ...messages25,
  ...messages26,
  ...messages27,
  ...messages28,
  ...messages29,
  ...messages30,
  ...messages31,
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

const MESSAGES_PER_PAGE = 50;

function App() {
  useTheme(); // Initialize theme
  
  const [messages] = useState<DiscordMessage[]>(messagesData);
  const [filteredMessages, setFilteredMessages] = useState<DiscordMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    content: '',
    authorId: '',
    channelId: '',
    guildId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Total stats - always show database totals, never filtered results
  const stats: MessageStats = useMemo(() => {
    const uniqueServers = new Set(messages.map(msg => msg.guild_id)).size;
    const uniqueUsers = new Set(messages.map(msg => msg.author_id)).size;
    
    return {
      totalMessages: messages.length,
      uniqueServers,
      uniqueUsers,
    };
  }, [messages]);

  // Pagination logic
  const totalPages = Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE);
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE;
    const endIndex = startIndex + MESSAGES_PER_PAGE;
    return filteredMessages.slice(startIndex, endIndex);
  }, [filteredMessages, currentPage]);

  const performSearch = () => {
    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(1); // Reset to first page on new search
    
    setTimeout(() => {
      const filtered = messages.filter(message => {
        const matchesContent = !filters.content || 
          message.content.toLowerCase().includes(filters.content.toLowerCase());
        const matchesAuthor = !filters.authorId || 
          message.author_id.toLowerCase().includes(filters.authorId.toLowerCase());
        const matchesChannel = !filters.channelId || 
          message.channel_id.toLowerCase().includes(filters.channelId.toLowerCase());
        const matchesGuild = !filters.guildId || 
          message.guild_id.toLowerCase().includes(filters.guildId.toLowerCase());

        return matchesContent && matchesAuthor && matchesChannel && matchesGuild;
      });
      
      setFilteredMessages(filtered);
      setIsLoading(false);
    }, 800);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthorClick = (authorId: string) => {
    setSelectedUserId(authorId);
  };

  const handleChannelClick = (channelId: string) => {
    setFilters(prev => ({ ...prev, channelId }));
    setCurrentPage(1);
    performSearch();
  };

  const handleGuildClick = (guildId: string) => {
    setFilters(prev => ({ ...prev, guildId }));
    setCurrentPage(1);
    performSearch();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Logo />
        <ThemeToggle />
      </div>

      {/* Stats Bar */}
      <StatsBar stats={stats} isFixed={true} />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8">
            Discord.cat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Advanced Discord message exploration and analytics platform. Search through conversations, analyze user activity, and discover insights with precision and style.
          </p>
        </div>

        {/* Search Interface */}
        <div className="mb-12">
          <SearchInterface
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={performSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Searching messages...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing conversations and filtering results
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <MessageDisplay
            messages={paginatedMessages}
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={filteredMessages.length}
            onPageChange={handlePageChange}
            onAuthorClick={handleAuthorClick}
            onChannelClick={handleChannelClick}
            onGuildClick={handleGuildClick}
          />
        )}
      </div>

      {/* Default state when no search has been performed */}
      {!hasSearched && !isLoading && (
        <div className="text-center py-20">
          <div className="text-gray-900 dark:text-white text-2xl font-bold mb-4">
            Ready to explore
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Enter your search criteria above to discover Discord messages, users, and conversations.
          </p>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <DiscordUserCard 
            userId={selectedUserId} 
            onClose={() => setSelectedUserId(null)}
          />
        </div>
      )}


    </div>
  );
}

export default App;