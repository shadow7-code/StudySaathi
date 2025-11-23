// Theme management with multiple theme options
class ThemeManager {
  static themes = {
    light: {
      name: 'Light',
      bg: 'bg-gray-50',
      card: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600'
    },
    dark: {
      name: 'Dark',
      bg: 'bg-gray-950',
      card: 'bg-gray-900',
      text: 'text-white',
      textSecondary: 'text-gray-400'
    },
    blue: {
      name: 'Ocean Blue',
      bg: 'bg-blue-50',
      card: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'blue'
    },
    green: {
      name: 'Forest Green',
      bg: 'bg-green-50',
      card: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'green'
    },
    purple: {
      name: 'Purple Dream',
      bg: 'bg-purple-50',
      card: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'purple'
    },
    darkBlue: {
      name: 'Midnight Blue',
      bg: 'bg-slate-950',
      card: 'bg-slate-900',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      accent: 'blue'
    },
    amoled: {
      name: 'AMOLED Black',
      bg: 'bg-black',
      card: 'bg-gray-900',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      accent: 'purple'
    }
  };

  static init() {
    const prefs = Storage.getUserPrefs();
    const theme = prefs.theme || 'light';
    this.setTheme(theme);
  }

  static setTheme(themeName) {
    if (!this.themes[themeName]) return;
    
    const theme = this.themes[themeName];
    const root = document.documentElement;
    
    // Remove all theme classes
    Object.keys(this.themes).forEach(t => {
      root.classList.remove(`theme-${t}`);
    });
    
    // Add new theme class
    root.classList.add(`theme-${themeName}`);
    
    // Update dark mode class for dark themes
    if (themeName === 'dark' || themeName === 'darkBlue' || themeName === 'amoled') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save preference
    const prefs = Storage.getUserPrefs();
    prefs.theme = themeName;
    Storage.saveUserPrefs(prefs);
  }

  static getCurrentTheme() {
    const prefs = Storage.getUserPrefs();
    return prefs.theme || 'light';
  }

  static getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      key,
      ...this.themes[key]
    }));
  }
}

// Initialize theme on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}

