// Wishlist API Service for Telegram Mini App
const API_BASE_URL = "https://api.wetrippo.com/api";

const OWNER_ID_KEY = "tg-wishlist-owner-id";

export interface WishlistItem {
  id: string;
  title: string;
  imageurl: string;
  producturl: string;
  source?: "local" | "api";
}

export interface CreateWishlistDto {
  title: string;
  imageurl: string;
  producturl: string;
}

export interface UpdateWishlistDto {
  title?: string;
  imageurl?: string;
  producturl?: string;
}

export interface AuthResponse {
  id: string;
  login: string;
}

// Auth helpers - using Telegram user ID as owner ID
export function getOwnerId(): string | null {
  if (typeof window === "undefined") return null;
  
  // Try to get from localStorage first
  const storedId = localStorage.getItem(OWNER_ID_KEY);
  if (storedId) return storedId;
  
  // Try to get from Telegram WebApp
  try {
    // @ts-ignore - Telegram WebApp SDK
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      const telegramUserId = String(tg.initDataUnsafe.user.id);
      setOwnerId(telegramUserId);
      return telegramUserId;
    }
  } catch (error) {
    console.error("Error getting Telegram user ID:", error);
  }
  
  return null;
}

export function setOwnerId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OWNER_ID_KEY, id);
}

export function clearOwnerId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OWNER_ID_KEY);
}

export function isAuthenticated(): boolean {
  return getOwnerId() !== null;
}

// Authenticate with Telegram user data
export async function authenticateWithTelegram(): Promise<string | null> {
  try {
    // @ts-ignore - Telegram WebApp SDK
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) {
      console.error("Telegram user data not available");
      return null;
    }

    const user = tg.initDataUnsafe.user;
    const telegramUserId = String(user.id);
    
    // Use Telegram user ID as the owner ID
    // You might want to sync this with your backend to create/update user
    setOwnerId(telegramUserId);
    return telegramUserId;
  } catch (error) {
    console.error("Error authenticating with Telegram:", error);
    return null;
  }
}

// Fetch public wishlist by owner ID (no authentication required)
export async function fetchPublicWishlist(
  ownerId: string
): Promise<WishlistItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ owner_id: ownerId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch public wishlist: ${response.statusText}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.data) ? data.data : [];
    return items.map(normalizeWishlistItem);
  } catch (error) {
    console.error("Error fetching public wishlist:", error);
    return [];
  }
}

type ApiWishlistRecord = {
  id?: string | number;
  _id?: string | number;
  ID?: string | number;
  slug?: string | number;
  title?: string;
  imageurl?: string;
  imageUrl?: string;
  producturl?: string;
  productUrl?: string;
};

const normalizeWishlistItem = (item: ApiWishlistRecord | null | undefined): WishlistItem => {
  const rawId =
    item?.id ??
    item?._id ??
    item?.ID ??
    (item?.slug ? `${item.slug}` : undefined);
  const globalCrypto: Crypto | undefined =
    typeof globalThis !== "undefined"
      ? (globalThis as unknown as { crypto?: Crypto }).crypto
      : undefined;
  const fallbackId =
    globalCrypto && "randomUUID" in globalCrypto
      ? globalCrypto.randomUUID()
      : `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: rawId !== undefined && rawId !== null ? String(rawId) : fallbackId,
    title: item?.title ?? "",
    imageurl: item?.imageurl ?? item?.imageUrl ?? "",
    producturl: item?.producturl ?? item?.productUrl ?? "",
    source: "api",
  };
};

// Fetch all wishlist items from API
export async function fetchWishlistItems(): Promise<WishlistItem[]> {
  const ownerId = getOwnerId();
  if (!ownerId) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ owner_id: ownerId }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch wishlist items: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    return items.map(normalizeWishlistItem);
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return [];
  }
}

// Create a new wishlist item
export async function createWishlistItem(
  item: CreateWishlistDto,
): Promise<WishlistItem | null> {
  const ownerId = getOwnerId();
  if (!ownerId) {
    throw new Error("Not authenticated");
  }

  try {
    const payload = {
      ...item,
      imageUrl: item.imageurl,
      productUrl: item.producturl,
      owner_id: ownerId,
    };

    const response = await fetch(`${API_BASE_URL}/wishlist/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create wishlist item: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const itemData = data?.data ?? data;
    return normalizeWishlistItem(itemData);
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    return null;
  }
}

// Update an existing wishlist item
export async function updateWishlistItem(
  id: string,
  updates: UpdateWishlistDto,
): Promise<WishlistItem | null> {
  const ownerId = getOwnerId();
  if (!ownerId) {
    throw new Error("Not authenticated");
  }

  try {
    const payload: Record<string, unknown> = { id, owner_id: ownerId };

    if (updates.title !== undefined) {
      payload.title = updates.title;
    }

    if (updates.imageurl !== undefined) {
      payload.imageurl = updates.imageurl;
      payload.imageUrl = updates.imageurl;
    }

    if (updates.producturl !== undefined) {
      payload.producturl = updates.producturl;
      payload.productUrl = updates.producturl;
    }

    const response = await fetch(`${API_BASE_URL}/wishlist/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update wishlist item: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const itemData = data?.data ?? data;
    return normalizeWishlistItem(itemData);
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return null;
  }
}

// Delete a wishlist item
export async function deleteWishlistItem(id: string): Promise<boolean> {
  const ownerId = getOwnerId();
  if (!ownerId) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, owner_id: ownerId }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete wishlist item: ${response.statusText}`,
      );
    }

    return true;
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    return false;
  }
}

