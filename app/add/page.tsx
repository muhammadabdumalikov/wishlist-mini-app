'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, Plus } from 'react-feather';
import dynamic from 'next/dynamic';
import BottomNavigation from '@/components/BottomNavigation';
import {
  createWishlistItem,
  getOwnerId,
  type CreateWishlistDto,
} from '@/lib/api/wishlist';

// Dynamically import BackButton to avoid SSR issues
const BackButton = dynamic(
  () => import('@twa-dev/sdk/react').then((mod) => mod.BackButton),
  { ssr: false }
);

export default function AddWishPage() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showMockButtons, setShowMockButtons] = useState(false);

  const maxDescriptionLength = 170;

  useEffect(() => {
    setIsMounted(true);
    
    const initBackButton = async () => {
      if (typeof window === 'undefined') return;
      
      // Check if we need to show mock buttons in browser dev mode
      // @ts-expect-error - Telegram WebApp SDK may not be typed
      const hasTelegramWebApp = window.Telegram?.WebApp;
      setShowMockButtons(!hasTelegramWebApp);
      
      // Programmatically control Telegram native BackButton
      if (hasTelegramWebApp) {
        try {
          // Wait for SDK to be ready
          const WebApp = (await import('@twa-dev/sdk')).default;
          
          // Ensure SDK is initialized
          WebApp.ready();
          WebApp.expand();
          
          // Show the back button - try multiple times to ensure it shows
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
        } catch (error) {
          console.error('Error initializing BackButton:', error);
        }
      }
    };
    
    initBackButton();
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/webp', 'image/svg+xml', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Пожалуйста, выберите изображение в формате .jpeg, .webp, .svg или .png');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ownerId = getOwnerId();
    if (!ownerId) {
      alert('Необходима авторизация');
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll use the image preview URL if available, or empty string
      // In production, you'd want to upload the image to a server first
      const imageUrl = imagePreview || '';
      
      const wishData: CreateWishlistDto = {
        title: title.trim(),
        imageurl: imageUrl,
        producturl: link.trim(),
      };

      await createWishlistItem(wishData);
      router.push('/');
    } catch (error) {
      console.error('Error creating wish:', error);
      alert('Ошибка при создании желания. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackButtonClick = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Native Telegram Back Button - always rendered, SDK controls visibility */}
      {isMounted && (
        <BackButton onClick={handleBackButtonClick} />
      )}

      {/* Header */}
      <header className="bg-background relative">
        {/* Top Bar - Native Telegram buttons */}
        <div className="h-12 relative">
          {/* Mock back button for browser dev mode */}
          {isMounted && showMockButtons && (
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-50">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full border border-grey-light shadow-sm hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-black" />
                <span className="text-sm font-medium text-black">Назад</span>
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full border border-grey-light shadow-sm hover:bg-background transition-colors">
                <ChevronDown className="w-3.5 h-3.5 text-black" />
                <span className="text-black text-base leading-none">...</span>
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold text-black">Добавить желание</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {/* Link Field */}
          <div className="space-y-2">
            <label htmlFor="link" className="text-sm font-medium text-black block">
              Ссылка, где купить желаемое
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://market.yandex.ru/gift"
              className="w-full px-4 py-3 border border-grey-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black placeholder:text-black/40"
            />
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-black block">
              Название<span className="text-black">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Игрушечная кухня с посудой и аксессуарами"
              required
              className="w-full px-4 py-3 border border-grey-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black placeholder:text-black/40"
            />
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-black block">
              Цена
            </label>
            <div className="relative">
              <input
                type="text"
                id="price"
                value={price}
                onChange={(e) => {
                  // Allow only numbers and spaces
                  const value = e.target.value.replace(/[^\d\s]/g, '');
                  setPrice(value);
                }}
                placeholder="3 609"
                className="w-full px-4 py-3 pr-10 border border-grey-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black placeholder:text-black/40"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/60 text-sm">
                ₽
              </span>
            </div>
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black block">
              Добавьте изображение
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className="w-24 h-24 border-2 border-dashed border-grey-light rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-secondary"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Plus className="w-8 h-8 text-black/60" />
                )}
                <input
                  type="file"
                  id="image-upload"
                  accept=".jpeg,.jpg,.webp,.svg,.png,image/jpeg,image/webp,image/svg+xml,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <div className="flex-1">
                <p className="text-xs text-black/60">
                  Нажмите на +, чтобы вставить изображение в формате .jpeg, .webp, .svg, или .png
                </p>
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-medium text-black block">
                Описание желания
              </label>
              <span className={`text-xs ${
                description.length > maxDescriptionLength ? 'text-black' : 'text-black/60'
              }`}>
                {description.length}/{maxDescriptionLength}
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= maxDescriptionLength) {
                  setDescription(value);
                }
              }}
              placeholder="Опишите ваше желание..."
              rows={4}
              className="w-full px-4 py-3 border border-grey-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black placeholder:text-black/40 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-6"
          >
            {isSubmitting ? 'Добавление...' : 'Добавить'}
          </button>
        </form>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation onAddClick={() => router.push('/add')} />
    </div>
  );
}

