import { Cat } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
      <Cat className="w-6 h-6" />
      <span className="text-xl font-bold">discord.cat</span>
    </div>
  );
};

export default Logo;