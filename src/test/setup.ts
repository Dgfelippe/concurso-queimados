import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && (!window.localStorage || typeof window.localStorage.setItem !== 'function')) {
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null
  };
  Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true });
}

