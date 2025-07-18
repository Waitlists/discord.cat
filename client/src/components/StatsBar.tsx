import { useState, useEffect } from 'react';
import { MessageStats } from '@shared/schema';

interface StatsBarProps {
  stats: MessageStats | null;
  isFixed?: boolean; // Always show total stats, not filtered
}

const StatsBar: React.FC<StatsBarProps> = ({ stats, isFixed = false }) => {
  const [animatedStats, setAnimatedStats] = useState({
    totalMessages: 0,
    uniqueServers: 0,
    uniqueUsers: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Only animate once when component first mounts
    if (!stats || (hasAnimated && isFixed)) return;
    
    const duration = 5000; // 5 seconds
    const fps = 60; // 60 FPS for smooth animation
    const totalFrames = (duration / 1000) * fps;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Smooth easing function (ease-out-cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        totalMessages: Math.floor(stats.totalMessages * easeOutCubic),
        uniqueServers: Math.floor(stats.uniqueServers * easeOutCubic),
        uniqueUsers: Math.floor(stats.uniqueUsers * easeOutCubic),
      });

      if (frame >= totalFrames) {
        clearInterval(timer);
        setAnimatedStats(stats); // Ensure final values are exact
        setHasAnimated(true);
      }
    }, 1000 / fps);

    return () => clearInterval(timer);
  }, [stats, hasAnimated, isFixed]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center gap-16 py-8 text-center">
        <div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Loading...
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Total Messages
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-16 py-8 text-center">
      <div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {animatedStats.totalMessages.toLocaleString()}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Total Messages
        </div>
      </div>
      
      <div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {animatedStats.uniqueUsers.toLocaleString()}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Total Users
        </div>
      </div>
      
      <div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {animatedStats.uniqueServers.toLocaleString()}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Total Servers
        </div>
      </div>
    </div>
  );
};

export default StatsBar;