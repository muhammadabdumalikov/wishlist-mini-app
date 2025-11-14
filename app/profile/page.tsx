'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronRight } from 'react-feather';
import dynamic from 'next/dynamic';
import BottomNavigation from '@/components/BottomNavigation';
import {
  getTelegramUser,
  type TelegramUser,
} from '@/lib/api/wishlist';

// Dynamically import BackButton to avoid SSR issues
const BackButton = dynamic(
  () => import('@twa-dev/sdk/react').then((mod) => mod.BackButton),
  { ssr: false }
);

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  hasNotification?: boolean;
  onClick: () => void;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [birthdate, setBirthdate] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Initialize Telegram WebApp
    const initTelegram = async () => {
      try {
        // Check if we're in Telegram WebApp
        // @ts-expect-error - Telegram WebApp SDK may not be typed
        const hasTelegramWebApp = typeof window !== 'undefined' && window.Telegram?.WebApp;
        
        if (hasTelegramWebApp) {
          const WebApp = (await import('@twa-dev/sdk')).default;
          WebApp.ready();
          WebApp.expand();

          // Show back button - try multiple times to ensure it shows
          const showButton = () => {
            if (WebApp?.BackButton) {
              WebApp.BackButton.show();
              // Retry after a short delay to ensure it's visible
              setTimeout(() => {
                if (WebApp?.BackButton) {
                  WebApp.BackButton.show();
                }
              }, 100);
            }
          };
          
          // Show immediately if SDK is already loaded
          showButton();
          
          // Also try after a short delay in case SDK needs time to initialize
          setTimeout(showButton, 50);
          setTimeout(showButton, 200);
        }

        // Get user data
        const tgUser = getTelegramUser();
        setUser(tgUser);

        // Load birthdate from localStorage (can be updated later)
        if (typeof window !== 'undefined') {
          const storedBirthdate = localStorage.getItem('user_birthdate');
          if (storedBirthdate) {
            setBirthdate(storedBirthdate);
          }
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleAddClick = () => {
    router.push('/add');
  };

  // Get full name
  const fullName = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : 'Пользователь';

  // Menu items
  const menuItems: MenuItem[] = [
    {
      id: 'edit',
      label: 'Редактировать профиль',
      onClick: () => {
        // TODO: Navigate to edit profile page
        console.log('Edit profile');
      },
    },
    {
      id: 'notifications',
      label: 'Уведомления',
      hasNotification: true, // TODO: Check if there are unread notifications
      onClick: () => {
        // TODO: Navigate to notifications page
        console.log('Notifications');
      },
    },
    {
      id: 'settings',
      label: 'Настройки',
      onClick: () => {
        // TODO: Navigate to settings page
        console.log('Settings');
      },
    },
    {
      id: 'calendar',
      label: 'Календарь событий',
      onClick: () => {
        // TODO: Navigate to event calendar page
        console.log('Event calendar');
      },
    },
    {
      id: 'support',
      label: 'Поддержка',
      onClick: () => {
        // TODO: Navigate to support page
        console.log('Support');
      },
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-grey-light">
        {/* Top bar with Menu button */}
        <div className="flex items-center justify-end px-4 py-3">
        </div>
        
        {/* Page Title */}
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold text-black">Профиль</h1>
        </div>
      </header>
      
      {/* BackButton - Telegram native button */}
      {isMounted && <BackButton onClick={handleClose} />}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 bg-background">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="px-4 py-6">
            {/* Profile Section */}
            <div className="flex flex-col items-center mb-8">
              {/* Profile Photo */}
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={fullName}
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-primary" />
                </div>
              )}
              
              {/* Name */}
              <h2 className="text-xl font-semibold text-black mb-2 text-center">
                {fullName}
              </h2>
              
              {/* Birthdate */}
              {birthdate ? (
                <p className="text-base text-black/60">{birthdate}</p>
              ) : null}
            </div>

            {/* Menu List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-grey-light' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.id === 'notifications' && item.hasNotification && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                    <span className="text-base font-medium text-black">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black/60" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation onAddClick={handleAddClick} />
    </div>
  );
}

