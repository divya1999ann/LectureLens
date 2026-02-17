import { create } from 'zustand';

const useThemeStore = create((set) => {
  // Check localStorage or system preference
  const savedTheme = localStorage.getItem('darkMode');
  const initialDarkMode = savedTheme 
    ? savedTheme === 'true' 
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Apply initial theme
  if (initialDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    darkMode: initialDarkMode,
    
    toggleDarkMode: () => set((state) => {
      const newDarkMode = !state.darkMode;
      localStorage.setItem('darkMode', newDarkMode.toString());
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { darkMode: newDarkMode };
    }),
  };
});

export default useThemeStore;
