'use client';

import { X, ChevronDown } from 'react-feather';

interface MockNativeButtonsProps {
  onClose?: () => void;
  onMore?: () => void;
}

export default function MockNativeButtons({ onClose, onMore }: MockNativeButtonsProps) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Default close behavior - close window or go back
      if (typeof window !== 'undefined') {
        import('@twa-dev/sdk').then(({ default: WebApp }) => {
          if (WebApp?.close) {
            WebApp.close();
          } else {
            window.history.back();
          }
        }).catch(() => {
          window.history.back();
        });
      }
    }
  };

  const handleMore = () => {
    if (onMore) {
      onMore();
    } else {
      // Default more options behavior
      console.log('More options clicked');
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-12 bg-transparent flex items-center justify-between px-4 z-50 pointer-events-none">
      {/* Left: Close Button */}
      <button
        onClick={handleClose}
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-grey-light shadow-sm hover:bg-white transition-colors"
      >
        <X className="w-3.5 h-3.5 text-grey-dark" />
        <span className="text-sm font-medium text-grey-dark">Закрыть</span>
      </button>

      {/* Right: More Options Button */}
      <button
        onClick={handleMore}
        className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-grey-light shadow-sm hover:bg-white transition-colors"
      >
        <ChevronDown className="w-3.5 h-3.5 text-grey-dark" />
        <span className="text-grey-dark text-base leading-none">...</span>
      </button>
    </div>
  );
}

