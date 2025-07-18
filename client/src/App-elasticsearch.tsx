import { useState, useEffect } from 'react';
import { DiscordMessage, SearchFilters } from './types';
import Logo from './components/Logo';
import ThemeToggle from './components/ThemeToggle';
import StatsBar from './components/StatsBar';
import SearchInterface from './components/SearchInterface';
import MessageDisplay from './components/MessageDisplay';
import Pagination from './components/Pagination';
import DiscordUserCard from './components/DiscordUserCard';
import ElasticsearchStatus from './components/ElasticsearchStatus';
import { useTheme } from './hooks/useTheme';
import { useElasticsearchSearch, useElasticsearchStats } from './hooks/useElasticsearch';

const MESSAGES_PER_PAGE = 50;

function App() {
  useTheme(); // Initialize theme
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    content: '',
    authorId: '',
    channelId: '',
    guildId: '',
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Elasticsearch hooks
  const { search, results, loading, error, reset } = useElasticsearchSearch();
  const { stats, loading: statsLoading } = useElasticsearchStats();

  // Perform search when filters change or page changes
  useEffect(() => {
    if (hasSearched) {
      performSearch();
    }
  }, [currentPage]);

  const performSearch = async () => {
    setHasSearched(true);
    setCurrentPage(1); // Reset to first page on new search
    
    const searchResults = await search(filters, currentPage, MESSAGES_PER_PAGE);
    
    if (searchResults) {
      console.log(`✅ Found ${searchResults.total} messages in ${searchResults.took}ms`);
    }
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

  const handleClearSearch = () => {
    setFilters({
      content: '',
      authorId: '',
      channelId: '',
      guildId: '',
    });
    setHasSearched(false);
    setCurrentPage(1);
    reset();
  };

  const totalPages = results ? Math.ceil(results.total / MESSAGES_PER_PAGE) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Logo />
        <div className="flex items-center gap-4">
          <ElasticsearchStatus />
          <ThemeToggle />
        </div>
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
            Lightning-fast Discord message search powered by Elasticsearch. Find conversations, analyze patterns, and explore your Discord history with precision.
          </p>
          {results && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
                <span className="font-semibold">⚡ Found {results.total.toLocaleString()} messages</span>
                <span className="text-sm opacity-70">in {results.took}ms</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Interface */}
        <div className="mb-12">
          <SearchInterface
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={performSearch}
            onClear={handleClearSearch}
            isLoading={loading}
            hasResults={hasSearched && results !== null}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Search Error
              </h3>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={performSearch}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Searching Elasticsearch...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Lightning-fast search in progress
            </p>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && results && !loading && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search Results
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {results.total.toLocaleString()} messages found in {results.took}ms
                </p>
              </div>
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear Search
              </button>
            </div>

            {/* Messages */}
            {results.messages.length > 0 ? (
              <>
                <div className="space-y-4">
                  {results.messages.map((message: DiscordMessage, index: number) => (
                    <MessageDisplay
                      key={`${message.message_id}-${index}`}
                      message={message}
                      onAuthorClick={handleAuthorClick}
                      onChannelClick={handleChannelClick}
                      onGuildClick={handleGuildClick}
                      isHighlighted={false}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Messages Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search filters or terms.
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default State */}
        {!hasSearched && !loading && (
          <div className="text-center py-20">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Use the search interface above to find messages by content, author, channel, or server.
                Elasticsearch provides lightning-fast results with fuzzy matching and advanced filtering.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Content Search</h4>
                  <p className="text-gray-600 dark:text-gray-400">Search message content with fuzzy matching</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Filter by User</h4>
                  <p className="text-gray-600 dark:text-gray-400">Find messages from specific users</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Channel & Server</h4>
                  <p className="text-gray-600 dark:text-gray-400">Filter by channel or server</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUserId && (
        <DiscordUserCard
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}

export default App;