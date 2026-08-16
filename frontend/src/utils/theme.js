// Theme utility functions
export const THEME_KEY = 'production-tracker-theme';

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  // Optionally respect system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

export const setStoredTheme = (theme) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};
