'use client';

import { useState, useEffect } from 'react';
import { Calendar, Bell, Gift, ChevronRight, Edit2, Trash2, ExternalLink } from 'react-feather';
import dynamic from 'next/dynamic';
import AddMenu from '../components/AddMenu';
import BottomNavigation from '../components/BottomNavigation';
import WishlistModal from '../components/WishlistModal';
import MockNativeButtons from '../components/MockNativeButtons';

// Dynamically import BackButton and WebApp to avoid SSR issues
const BackButton = dynamic(
  () => import('@twa-dev/sdk/react').then((mod) => mod.BackButton),
  { ssr: false }
);
import {
  fetchWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  authenticateWithTelegram,
  getOwnerId,
  isBrowserDevMode,
  getTelegramUsername,
  getTelegramFirstName,
  type WishlistItem,
  type CreateWishlistDto,
  type UpdateWishlistDto,
} from '@/lib/api/wishlist';

export default function WishlistPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showMockButtons, setShowMockButtons] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize Telegram WebApp and authenticate
  useEffect(() => {
    // Mark as mounted to avoid hydration mismatch
    setIsMounted(true);
    
    // Set ownerId client-side only to avoid hydration mismatch
    setOwnerId(getOwnerId());
    
    // Set username and first name for display
    setUsername(getTelegramUsername());
    setFirstName(getTelegramFirstName());
    
    // Check if we need to show mock native buttons in browser dev mode
    setShowMockButtons(isBrowserDevMode());

    const initTelegram = async () => {
      try {
        // Dynamically import WebApp only on client side
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        WebApp.ready();
        WebApp.expand();

        // Initialize native settings button if available
        if (WebApp.SettingsButton && WebApp.SettingsButton.isVisible !== undefined) {
          WebApp.SettingsButton.show();
          WebApp.SettingsButton.onClick(() => {
            // Handle settings button click
            // You can open a settings modal or navigate to settings page
            console.log('Settings clicked');
          });
        }

        // Authenticate with Telegram user
        const userId = await authenticateWithTelegram();
        if (userId) {
          setOwnerId(userId);
          // Update username and first name after authentication
          setUsername(getTelegramUsername());
          setFirstName(getTelegramFirstName());
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    };

    initTelegram();
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    setIsLoading(true);
    try {
      // Update ownerId before checking authentication
      const currentOwnerId = getOwnerId();
      if (currentOwnerId) {
        setOwnerId(currentOwnerId);
        const items = await fetchWishlistItems();
        setWishlists(items);
      } else {
        setWishlists([]);
      }
    } catch (error) {
      console.error('Error loading wishlists:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateItem = async (data: CreateWishlistDto) => {
    try {
      const newItem = await createWishlistItem(data);
      if (newItem) {
        setWishlists((prev) => [...prev, newItem]);
        setIsModalOpen(false);
        setShowAddMenu(false);
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async (data: UpdateWishlistDto) => {
    if (!selectedItem) return;
    try {
      const updatedItem = await updateWishlistItem(selectedItem.id, data);
      if (updatedItem) {
        setWishlists((prev) =>
          prev.map((item) => (item.id === selectedItem.id ? updatedItem : item))
        );
        setIsModalOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const success = await deleteWishlistItem(itemToDelete.id);
      if (success) {
        setWishlists((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setShowDeleteConfirm(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setModalMode('create');
    setIsModalOpen(true);
    setShowAddMenu(false);
  };

  const openEditModal = (item: WishlistItem) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: WishlistItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleBackButtonClick = () => {
    if (typeof window !== 'undefined') {
      import('@twa-dev/sdk').then(({ default: WebApp }) => {
        WebApp.close();
      });
    }
  };

  return (
    <div className="min-h-screen bg-mini-app-bg flex flex-col">
      {/* Native Telegram Back Button - only rendered on client (ssr: false) */}
      <BackButton onClick={handleBackButtonClick} />

      {/* Header */}
      <header className="bg-white relative">
        {/* Top Bar - Native Telegram buttons are handled by SDK, or mock buttons in browser dev mode */}
        <div className="h-12 relative">
          {showMockButtons && <MockNativeButtons />}
        </div>

        {/* Title Section */}
        <div className="px-4 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-primary">Вишлисты</h1>
            <div className="flex items-center gap-4">
              <button className="text-grey-dark hover:text-primary transition-colors">
                <Calendar className="w-6 h-6" />
              </button>
              <button className="text-grey-dark hover:text-primary transition-colors">
                <Bell className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex w-full border-b border-grey-light">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex-1 pb-3 text-base font-semibold transition-colors text-center ${
                activeTab === 'current'
                  ? 'text-primary border-b-2 border-primary -mb-[1px]'
                  : 'text-grey hover:text-grey-dark'
              }`}
            >
              Актуально
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`flex-1 pb-3 text-base font-semibold transition-colors text-center ${
                activeTab === 'archive'
                  ? 'text-primary border-b-2 border-primary -mb-[1px]'
                  : 'text-grey hover:text-grey-dark'
              }`}
            >
              Архив
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 bg-white">
        <div className="px-4 py-4">
          {/* User Info Display - for testing in production */}
          {isMounted && (username || firstName) && (
            <div className="mb-4 p-3 bg-mini-app-background rounded-lg border border-grey-light">
              <p className="text-xs text-grey mb-1">Telegram User:</p>
              {firstName && (
                <p className="text-sm font-medium text-primary">First Name: {firstName}</p>
              )}
              {username && (
                <p className="text-sm font-medium text-primary">Username: @{username}</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple border-t-transparent"></div>
              <p className="mt-4 text-grey text-sm">Загрузка...</p>
            </div>
          )}

          {/* Wishlist Card */}
          {!isLoading && ownerId && (
            <button className="w-full bg-mini-app-background rounded-xl p-4 mb-4 hover:bg-white transition-colors text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-mini-app-icon-bg flex items-center justify-center">
                    <Gift className="w-6 h-6 text-purple" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-primary mb-0.5">Мои желания</h3>
                    <p className="text-sm text-grey">{wishlists.length} {wishlists.length === 1 ? 'желание' : wishlists.length < 5 ? 'желания' : 'желаний'}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-grey" />
              </div>
            </button>
          )}

          {/* Wishlist Items */}
          {!isLoading && wishlists.length > 0 && (
            <div className="space-y-3">
              {wishlists.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-grey-light rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      {item.imageurl ? (
                        <img
                          src={item.imageurl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple/5 to-magenta/5">
                          <Gift className="w-8 h-8 text-purple/40" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-primary mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <a
                          href={item.producturl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <span>Открыть</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && wishlists.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-mini-app-icon-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple" />
              </div>
              <p className="text-grey text-sm leading-relaxed">
                Здесь появятся ваши вишлисты, нажмите на +, чтобы добавить первый
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation onAddClick={() => setShowAddMenu(true)} />

      {/* Add Menu Modal */}
      {showAddMenu && (
        <AddMenu 
          onClose={() => setShowAddMenu(false)}
          onCreateWishlist={openCreateModal}
        />
      )}

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={async (data) => {
          if (modalMode === 'create') {
            await handleCreateItem(data as CreateWishlistDto);
          } else {
            await handleUpdateItem(data as UpdateWishlistDto);
          }
        }}
        item={selectedItem}
        mode={modalMode}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-primary mb-2">Удалить желание?</h3>
            <p className="text-grey text-sm mb-6">
              Вы уверены, что хотите удалить &quot;{itemToDelete.title}&quot;?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-grey-light text-grey rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteItem}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

