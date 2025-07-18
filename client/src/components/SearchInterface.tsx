import { useState } from 'react';
import { Search, Filter, X, Zap, Database } from 'lucide-react';
import { SearchFilters } from '@shared/schema';

interface SearchInterfaceProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      content: '',
      authorId: '',
      channelId: '',
      guildId: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages, users, channels, or servers..."
              value={filters.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isExpanded 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={onSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              Search
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="mt-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Author ID</label>
                <input
                  type="text"
                  placeholder="Filter by author..."
                  value={filters.authorId}
                  onChange={(e) => handleInputChange('authorId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Channel ID</label>
                <input
                  type="text"
                  placeholder="Filter by channel..."
                  value={filters.channelId}
                  onChange={(e) => handleInputChange('channelId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Guild ID</label>
                <input
                  type="text"
                  placeholder="Filter by server..."
                  value={filters.guildId}
                  onChange={(e) => handleInputChange('guildId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;