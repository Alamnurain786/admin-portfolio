// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

function useDarkMode() {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.theme) {
      return localStorage.theme;
    }
    // Check system preference
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  // colorTheme is the opposite of theme, used for toggle logic
  const colorTheme = theme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove the opposite theme class and add the current theme class
    root.classList.remove(colorTheme);
    root.classList.add(theme);
    // Store current theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme, colorTheme]); // Re-run effect if theme or colorTheme changes

  return [colorTheme, setTheme]; // Return the opposite theme for the button and the setter
}

export default useDarkMode;
