
import CryptoJS from 'crypto-js';

// Generate a key from user session or browser fingerprint
const generateStorageKey = (): string => {
  const browserData = navigator.userAgent + navigator.language + screen.width + screen.height;
  return CryptoJS.SHA256(browserData + 'stockwatch_secure').toString();
};

export const secureStorage = {
  set: (key: string, data: any): void => {
    try {
      const storageKey = generateStorageKey();
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), storageKey).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw new Error('Data encryption failed');
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const storageKey = generateStorageKey();
      const decrypted = CryptoJS.AES.decrypt(encrypted, storageKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) return null;
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  }
};

export const validateInput = {
  symbol: (value: string): boolean => {
    return /^[A-Z]{1,10}$/.test(value.trim());
  },

  number: (value: string, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  shares: (value: string): boolean => {
    return validateInput.number(value, 0.0001, 1000000);
  },

  price: (value: string): boolean => {
    return validateInput.number(value, 0.01, 100000);
  },

  percentage: (value: string): boolean => {
    return validateInput.number(value, -100, 1000);
  },

  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  },

  sanitizeString: (value: string): string => {
    return value.replace(/[<>'"&]/g, '').trim();
  }
};
