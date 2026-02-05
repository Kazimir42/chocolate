/**
 * Safe localStorage utilities with error handling
 */

/**
 * Safely get and parse JSON from localStorage
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} The parsed value or defaultValue
 */
export function getStorageItem(key, defaultValue = null) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely get a number from localStorage
 * @param {string} key - The localStorage key
 * @param {number} defaultValue - Default value if key doesn't exist or is invalid
 * @returns {number} The parsed number or defaultValue
 */
export function getStorageNumber(key, defaultValue = 0) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    const parsed = parseInt(item, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set JSON in localStorage
 * @param {string} key - The localStorage key
 * @param {*} value - The value to store
 */
export function setStorageItem(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full or disabled
  }
}

/**
 * Safely set a value in localStorage (without JSON stringify)
 * @param {string} key - The localStorage key
 * @param {*} value - The value to store
 */
export function setStorageValue(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage might be full or disabled
  }
}
