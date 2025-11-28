/**
 * Simple localStorage utility with error handling
 */

/**
 * Set a value in localStorage
 * @param key - The storage key
 * @param value - The value to store
 */
export const setStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to set storage for key "${key}":`, error);
  }
};

/**
 * Get a value from localStorage
 * @param key - The storage key
 * @returns The stored value or null
 */
export const getStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get storage for key "${key}":`, error);
    return null;
  }
};

/**
 * Clear a value from localStorage
 * @param key - The storage key
 */
export const clearStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear storage for key "${key}":`, error);
  }
};
