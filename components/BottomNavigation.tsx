'use client';

import { Home, Search, Plus, Gift, User } from 'react-feather';

interface BottomNavigationProps {
  onAddClick: () => void;
}

export default function BottomNavigation({ onAddClick }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-mini-app-background border-t border-grey-light z-40">
      <div className="flex items-center justify-around px-2 py-2">
        {/* Вишлисты */}
        <button className="flex flex-col items-center gap-1 px-3 py-2 text-black">
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Вишлисты</span>
        </button>

        {/* Поиск */}
        <button className="flex flex-col items-center gap-1 px-3 py-2 text-black/60 hover:text-black transition-colors">
          <Search className="w-5 h-5" />
          <span className="text-xs font-medium">Поиск</span>
        </button>

        {/* Add Button - Floating */}
        <button
          onClick={onAddClick}
          className="relative w-14 h-9 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Я дарю */}
        <button className="flex flex-col items-center gap-1 px-3 py-2 text-black/60 hover:text-black transition-colors">
          <Gift className="w-5 h-5" />
          <span className="text-xs font-medium">Я дарю</span>
        </button>

        {/* Профиль */}
        <button className="flex flex-col items-center gap-1 px-3 py-2 text-black/60 hover:text-black transition-colors">
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">Профиль</span>
        </button>
      </div>
    </nav>
  );
}

