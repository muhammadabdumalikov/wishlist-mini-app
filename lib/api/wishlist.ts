// Wishlist API Service for Telegram Mini App
const API_BASE_URL = "https://api.wetrippo.com/api";
const AUTH_BASE_URL = "https://api.wetrippo.com";

const OWNER_ID_KEY = "w-o-id";
const MOCK_USER_ID_KEY = "mock-tg-user-id";

// Get Telegram WebApp instance or mock for development
function getTelegramWebApp() {
  if (typeof window === "undefined") return null;

  // @ts-expect-error - Telegram WebApp SDK may not be typed
  const tg = window.Telegram?.WebApp;

  // Check if Telegram WebApp exists AND has valid user data
  // In dev mode, if it exists but doesn't have user data, we'll use the mock
  const hasValidUserData = tg?.initDataUnsafe?.user?.id;

  // If Telegram WebApp exists with valid user data, return it
  if (tg && hasValidUserData) return tg;

  // In development (browser), create a mock if Telegram WebApp is not available or not initialized
  // Check for development environment - safe because we already confirmed window exists
  const isDev = process.env.NODE_ENV === "development";
  // Also check if we're on localhost (but only if window exists, which we already checked)
  let isLocalhost = false;
  try {
    isLocalhost = window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
  } catch {
    // Safe fallback if location is not accessible
    isLocalhost = false;
  }

  if (isDev || isLocalhost) {
    // Generate or retrieve a consistent mock user ID
    let mockUserId = localStorage.getItem(MOCK_USER_ID_KEY);
    if (!mockUserId) {
      mockUserId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(MOCK_USER_ID_KEY, mockUserId);
    }

    return {
      initDataUnsafe: {
        user: {
          id: parseInt(mockUserId.replace(/[^0-9]/g, "").slice(0, 10)) || 123456789,
          first_name: "Dev",
          last_name: "User",
          username: "dev_user",
          language_code: "en",
          photo_url: "https://ui-avatars.com/api/?name=Dev+User&background=8b5cf6&color=fff&size=128",
        },
      },
      ready: () => { },
      expand: () => { },
      close: () => { },
      showAlert: (message: string) => {
        alert(message);
      },
    };
  }

  return null;
}

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

export interface TelegramAuthResponse {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

// Auth helpers - using Telegram user ID as owner ID
export function getOwnerId(): string | null {
  if (typeof window === "undefined") return null;
  
  // Try to get from localStorage first
  const storedId = localStorage.getItem(OWNER_ID_KEY);
  if (storedId) return storedId;
  
  // Try to get from Telegram WebApp
  try {
    const tg = getTelegramWebApp();
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

// Check if we're in browser dev mode (using mock instead of real Telegram WebApp)
export function isBrowserDevMode(): boolean {
  if (typeof window === "undefined") return false;

  // @ts-expect-error - Telegram WebApp SDK may not be typed
  const tg = window.Telegram?.WebApp;
  const hasValidUserData = tg?.initDataUnsafe?.user?.id;

  // If Telegram WebApp exists with valid user data, we're in real Telegram
  if (tg && hasValidUserData) return false;

  // Otherwise, check if we're in dev environment
  const isDev = process.env.NODE_ENV === "development";
  let isLocalhost = false;
  try {
    isLocalhost = window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
  } catch {
    isLocalhost = false;
  }

  return isDev || isLocalhost;
}

// Get Telegram user username
export function getTelegramUsername(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const tg = getTelegramWebApp();
    const username = tg?.initDataUnsafe?.user?.username;
    return username || null;
  } catch (error) {
    console.error("Error getting Telegram username:", error);
    return null;
  }
}

// Get Telegram user first name
export function getTelegramFirstName(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const tg = getTelegramWebApp();
    const firstName = tg?.initDataUnsafe?.user?.first_name;
    return firstName || null;
  } catch (error) {
    console.error("Error getting Telegram first name:", error);
    return null;
  }
}

// Get Telegram user last name
export function getTelegramLastName(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const tg = getTelegramWebApp();
    const lastName = tg?.initDataUnsafe?.user?.last_name;
    return lastName || null;
  } catch (error) {
    console.error("Error getting Telegram last name:", error);
    return null;
  }
}

// Get Telegram user photo URL
export function getTelegramPhotoUrl(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const tg = getTelegramWebApp();
    const photoUrl = tg?.initDataUnsafe?.user?.photo_url;
    return photoUrl || null;
  } catch (error) {
    console.error("Error getting Telegram photo URL:", error);
    return null;
  }
}

// Get full Telegram user object
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export function getTelegramUser(): TelegramUser | null {
  if (typeof window === "undefined") return null;

  try {
    const tg = getTelegramWebApp();
    const user = tg?.initDataUnsafe?.user;
    if (!user) return null;
    return {
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      photo_url: user.photo_url,
    };
  } catch (error) {
    console.error("Error getting Telegram user:", error);
    return null;
  }
}

// Authenticate with Telegram user data via API
// Sends sign-in API call only when:
// 1. It's a Telegram Mini App (has Telegram WebApp with valid initData)
// 2. OR NODE_ENV === "test" (for testing purposes)
// Skips API call if user ID already exists in localStorage
export async function authenticateWithTelegram(): Promise<string | null> {
  try {
    console.log("[Auth] Starting authentication...");

    // Check if we already have the user ID stored - if so, skip API call
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem(OWNER_ID_KEY);
      if (storedId) {
        console.log("[Auth] User ID already stored in localStorage:", storedId);
        console.log("[Auth] Skipping sign-in API call");
        return storedId;
      }
    }

    // Check if we're in test environment
    const isTestMode = true //process.env.NODE_ENV === "test";

    // Check if we're in real Telegram Mini App
    // @ts-expect-error - Telegram WebApp SDK may not be typed
    const tg = window.Telegram?.WebApp;

    // Check if we have valid Telegram WebApp with initData
    const hasTelegramWebApp = !!tg;
    const hasValidUserData = !!tg?.initDataUnsafe?.user?.id;
    const hasInitData = !!tg?.initData;
    const isTelegramMiniApp = hasTelegramWebApp && hasValidUserData && hasInitData;

    console.log("[Auth] Checking conditions:", {
      isTestMode: isTestMode,
      isTelegramMiniApp: isTelegramMiniApp,
      hasTelegram: hasTelegramWebApp,
      hasUserData: hasValidUserData,
      hasInitData: hasInitData,
    });

    // Only proceed if:
    // 1. It's a Telegram Mini App (has tg && hasUserData && hasInitData)
    // 2. OR NODE_ENV === "test"
    const shouldCallAPI = isTelegramMiniApp || isTestMode;

    if (!shouldCallAPI) {
      console.error("[Auth] Not calling API - not in Telegram Mini App and not in test mode");
      console.error("[Auth] Requirements: isTelegramMiniApp=", isTelegramMiniApp, "isTestMode=", isTestMode);
      return null;
    }

    // Prepare request body with parsed fields from Telegram WebApp or test data
    let requestBody: {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
      auth_date?: number;
      hash?: string;
    } = {};

    if (isTelegramMiniApp && tg?.initDataUnsafe) {
    // In Telegram Mini App, extract data from initDataUnsafe (already parsed)
      const user = tg.initDataUnsafe.user;

      if (!user?.id || !user?.first_name) {
        console.error("[Auth] Missing required user data: id or first_name");
        return null;
      }

      // Get raw initData string to parse hash and auth_date
      // The hash is in the raw query string, not in initDataUnsafe
      const rawInitData = tg.initData || '';
      let hash = '';
      let authDate: number | undefined;

      // Parse the raw initData query string format: "key=value&key2=value2"
      if (rawInitData) {
        try {
          const params = new URLSearchParams(rawInitData);
          hash = params.get('hash') || '';
          const authDateStr = params.get('auth_date');
          authDate = authDateStr ? parseInt(authDateStr, 10) : undefined;
        } catch (error) {
          console.error("[Auth] Error parsing initData query string:", error);
        }
      }

      // Use auth_date from initDataUnsafe if available, otherwise from parsed query string
      authDate = tg.initDataUnsafe.auth_date || authDate;

      if (!hash) {
        console.error("[Auth] Hash not found in initData - required for backend verification");
        return null;
      }

      if (!authDate) {
        console.error("[Auth] auth_date not found - required for backend verification");
        return null;
      }

      // Build request body matching backend's expected format
      // Backend expects: id, first_name, last_name?, username?, photo_url?, auth_date, hash
      requestBody = {
        id: user.id, // Required - must be number
        first_name: user.first_name || '', // Required - must not be empty
        auth_date: authDate, // Required - must be number
        hash: hash, // Required - must not be empty
      };

      // Optional fields - only include if they exist
      if (user.last_name) {
        requestBody.last_name = user.last_name;
      }
      if (user.username) {
        requestBody.username = user.username;
      }
      if (user.photo_url) {
        requestBody.photo_url = user.photo_url;
      }

      console.log("[Auth] Telegram Mini App: Using data from Telegram WebApp");
      console.log("[Auth] Extracted fields:", {
        id: requestBody.id,
        first_name: requestBody.first_name,
        auth_date: requestBody.auth_date,
        hash: requestBody.hash ? `${requestBody.hash.substring(0, 10)}...` : 'missing',
      });
    } else if (isTestMode) {
      // In test mode, use test data structure
      requestBody = {
        "id": 123456789,
        "first_name": "Test",
        "last_name": "User",
        "username": "test_user",
        "language_code": "en",
        "photo_url": "https://ui-avatars.com/api/?name=Dev+User&background=8b5cf6&color=fff&size=128",
        "auth_date": 1763149102,
        "hash": "1de06ede52ec6f34b16a3aae41529da023056220927a07bf9fb8e0d281d61119"
      };

      console.log("[Auth] Test mode: Using test data structure");
    } else {
      console.error("[Auth] No data available - not in Telegram Mini App and not in test mode");
      return null;
    }

    console.log("[Auth] Request body:", JSON.stringify(requestBody));
    // Validate required fields
    if (!requestBody.id || !requestBody.first_name || !requestBody.auth_date || !requestBody.hash) {
      console.error("[Auth] Missing required fields:", {
        hasId: !!requestBody.id,
        hasFirstName: !!requestBody.first_name,
        hasAuthDate: !!requestBody.auth_date,
        hasHash: !!requestBody.hash,
      });
      throw new Error("Missing required authentication fields");
    }

    console.log("[Auth] Sending parsed data to API:", {
      id: requestBody.id,
      first_name: requestBody.first_name,
      auth_date: requestBody.auth_date,
      hasHash: !!requestBody.hash,
    });

    // Call sign-in API with parsed fields
    const response = await fetch(`${AUTH_BASE_URL}/api/wishlist-auth/telegram/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[Auth] API Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Auth] API Error response:", errorText);
      throw new Error(`Authentication failed: ${response.statusText} - ${errorText}`);
    }

    const userData: TelegramAuthResponse = await response.json();
    console.log("[Auth] API Response data:", userData);

    // Save the user ID (24-character ID) to localStorage with key 'w-o-id'
    if (userData.id) {
      const userId = String(userData.id);
      setOwnerId(userId);
      console.log("[Auth] Authentication successful! 24-char ID saved to 'w-o-id':", userId);
      console.log("[Auth] ID length:", userId.length);
      if (isTestMode) {
        console.log("[Auth] ✓ Test mode authentication successful!");
      }
      return userId;
    }

    console.error("[Auth] No user ID in API response");
    return null;
  } catch (error) {
    console.error("[Auth] Error authenticating with Telegram:", error);
    if (error instanceof Error) {
      console.error("[Auth] Error details:", error.message, error.stack);
    }

    // No fallback - if API fails, return null
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

