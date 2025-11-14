'use client';

import { useRouter } from 'next/navigation';
import { X, Gift } from 'react-feather';

interface AddMenuProps {
  onClose: () => void;
  onCreateWishlist?: () => void;
}

export default function AddMenu({ onClose, onCreateWishlist }: AddMenuProps) {
  const router = useRouter();

  const handleCreateWish = () => {
    onClose();
    // Always navigate to the add page instead of opening modal
    router.push('/add');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-t-2xl p-4 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">Добавить</h2>
          <button
            onClick={onClose}
            className="text-grey hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex gap-4">
          {/* Желание */}
          <button 
            onClick={handleCreateWish}
            className="flex-1 bg-purple rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-purple/90 transition-colors shadow-md"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-medium text-sm">Желание</span>
          </button>
        </div>
      </div>
    </div>
  );
}

