'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Image, Link2 } from 'react-feather';
import type { WishlistItem, CreateWishlistDto, UpdateWishlistDto } from '@/lib/api/wishlist';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWishlistDto | UpdateWishlistDto) => Promise<void>;
  item?: WishlistItem | null;
  mode: 'create' | 'edit';
}

const translations = {
  createTitle: 'Добавить новое желание',
  editTitle: 'Редактировать желание',
  titleLabel: 'Название',
  titlePlaceholder: 'Введите название товара',
  imageUrlLabel: 'URL изображения',
  imageUrlPlaceholder: 'https://example.com/image.jpg',
  productUrlLabel: 'URL товара',
  productUrlPlaceholder: 'https://example.com/product',
  cancel: 'Отмена',
  save: 'Сохранить',
  create: 'Создать',
  saving: 'Сохранение...',
};

export default function WishlistModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  mode,
}: WishlistModalProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item && mode === 'edit') {
      setTitle(item.title);
      setImageUrl(item.imageurl ?? '');
      setProductUrl(item.producturl ?? '');
    } else {
      setTitle('');
      setImageUrl('');
      setProductUrl('');
    }
  }, [item, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        imageurl: imageUrl,
        producturl: productUrl,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl w-full max-w-sm max-h-[90vh] overflow-hidden shadow-lg">
        <div className="bg-primary p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-md">
                <Gift className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">
                {mode === 'create' ? translations.createTitle : translations.editTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-2">
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-black">
              <Gift className="w-4 h-4" />
              {translations.titleLabel}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={translations.titlePlaceholder}
              required
              className="w-full px-4 py-2.5 border border-grey-light rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black placeholder:text-black/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="flex items-center gap-2 text-sm font-medium text-black">
              <Image className="w-4 h-4" />
              {translations.imageUrlLabel}
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={translations.imageUrlPlaceholder}
              required
              className="w-full px-4 py-2.5 border border-grey-light rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black placeholder:text-black/40"
            />
            {imageUrl && (
              <div className="mt-3 rounded-md overflow-hidden border border-grey-light shadow-sm">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="productUrl" className="flex items-center gap-2 text-sm font-medium text-black">
              <Link2 className="w-4 h-4" />
              {translations.productUrlLabel}
            </label>
            <input
              type="url"
              id="productUrl"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder={translations.productUrlPlaceholder}
              required
              className="w-full px-4 py-2.5 border border-grey-light rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black placeholder:text-black/40"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 border border-grey-light text-black rounded-md font-medium hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translations.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? translations.saving : mode === 'create' ? translations.create : translations.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

