'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, Plus, Image as ImageIcon } from 'react-feather';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showBackButton, setShowBackButton] = useState(true);

  const maxDescriptionLength = 170;

  useEffect(() => {
    setIsMounted(true);
    
    // Programmatically control Telegram native BackButton
    if (isMounted && typeof window !== 'undefined') {
      import('@twa-dev/sdk').then(({ default: WebApp }) => {
        if (WebApp?.BackButton) {
          WebApp.BackButton.show();
        }
      }).catch(() => {
        // SDK not available, ignore
      });
    }
  }, [isMounted]);

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
      
      setImageFile(file);
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Native Telegram Back Button */}
      {isMounted && showBackButton && (
        <BackButton onClick={handleBackButtonClick} />
      )}

      {/* Header */}
      <header className="bg-white relative">
        {/* Top Bar - Native Telegram buttons */}
        <div className="h-12 relative">
          {/* Mock back button for browser dev mode */}
          {typeof window !== 'undefined' && !window?.Telegram?.WebApp && (
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-50">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-grey-light shadow-sm hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-grey-dark" />
                <span className="text-sm font-medium text-grey-dark">Назад</span>
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-grey-light shadow-sm hover:bg-white transition-colors">
                <ChevronDown className="w-3.5 h-3.5 text-grey-dark" />
                <span className="text-grey-dark text-base leading-none">...</span>
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold text-primary">Добавить желание</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {/* Link Field */}
          <div className="space-y-2">
            <label htmlFor="link" className="text-sm font-medium text-primary block">
              Ссылка, где купить желаемое
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://market.yandex.ru/gift"
              className="w-full px-4 py-3 border border-grey-light rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none transition-all text-primary placeholder:text-grey"
            />
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-primary block">
              Название<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Игрушечная кухня с посудой и аксессуарами"
              required
              className="w-full px-4 py-3 border border-grey-light rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none transition-all text-primary placeholder:text-grey"
            />
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-primary block">
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
                className="w-full px-4 py-3 pr-10 border border-grey-light rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none transition-all text-primary placeholder:text-grey"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grey text-sm">
                ₽
              </span>
            </div>
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary block">
              Добавьте изображение
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className="w-24 h-24 border-2 border-dashed border-grey-light rounded-lg flex items-center justify-center cursor-pointer hover:border-purple transition-colors bg-gray-50"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Plus className="w-8 h-8 text-grey" />
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
                <p className="text-xs text-grey">
                  Нажмите на +, чтобы вставить изображение в формате .jpeg, .webp, .svg, или .png
                </p>
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-medium text-primary block">
                Описание желания
              </label>
              <span className={`text-xs ${
                description.length > maxDescriptionLength ? 'text-red-500' : 'text-grey'
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
              className="w-full px-4 py-3 border border-grey-light rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none transition-all text-primary placeholder:text-grey resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full py-4 bg-purple text-white rounded-lg font-medium hover:bg-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-6"
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

