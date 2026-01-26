import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Storage keys
const AUTH_STORAGE_KEY = "recall_auth_token"
const USER_STORAGE_KEY = "recall_user_data"

/**
 * Auth data stored in chrome.storage
 */
interface StoredAuthData {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  user?: {
    id: string
    email?: string
  }
}

/**
 * Save auth data to chrome.storage.local
 * Called when web app sends auth token via message passing
 */
export async function saveAuthToStorage(data: StoredAuthData): Promise<void> {
  try {
    await chrome.storage.local.set({
      [AUTH_STORAGE_KEY]: data.accessToken,
      [USER_STORAGE_KEY]: {
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        user: data.user,
      },
    })
    console.log("✓ Auth saved to chrome.storage")
  } catch (error) {
    console.error("Failed to save auth to storage:", error)
    throw error
  }
}

/**
 * Get the session token from chrome.storage
 * This replaces the cookie-based approach
 */
export async function getSessionFromStorage(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get([AUTH_STORAGE_KEY, USER_STORAGE_KEY])
    const token = result[AUTH_STORAGE_KEY]
    
    if (!token) {
      console.log("No auth token in storage")
      return null
    }
    
    // Check if token might be expired
    const userData = result[USER_STORAGE_KEY]
    if (userData?.expiresAt && Date.now() > userData.expiresAt * 1000) {
      console.log("Token appears expired, clearing storage")
      await clearAuthStorage()
      return null
    }
    
    console.log("✓ Found auth token in storage")
    return token
  } catch (error) {
    console.error("Error getting session from storage:", error)
    return null
  }
}

/**
 * Clear auth data from storage (logout)
 */
export async function clearAuthStorage(): Promise<void> {
  try {
    await chrome.storage.local.remove([AUTH_STORAGE_KEY, USER_STORAGE_KEY])
    console.log("✓ Auth cleared from storage")
  } catch (error) {
    console.error("Failed to clear auth storage:", error)
  }
}

/**
 * Get user data from storage
 */
export async function getUserFromStorage(): Promise<{ id: string; email?: string } | null> {
  try {
    const result = await chrome.storage.local.get(USER_STORAGE_KEY)
    return result[USER_STORAGE_KEY]?.user || null
  } catch (error) {
    console.error("Error getting user from storage:", error)
    return null
  }
}

/**
 * Legacy function name for compatibility - now uses storage
 */
export async function getSessionFromCookies(): Promise<string | null> {
  return getSessionFromStorage()
}

/**
 * Create an authenticated Supabase client using the stored token
 */
export async function getAuthenticatedClient() {
  const token = await getSessionFromStorage()
  
  if (!token) {
    return null
  }
  
  // Set the session for this client
  const { data, error } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: "",
  })
  
  if (error || !data.session) {
    console.error("Failed to set session:", error)
    return null
  }
  
  return supabase
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionFromStorage()
  return token !== null
}
