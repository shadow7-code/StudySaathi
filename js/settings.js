// Settings functionality
class SettingsManager {
  constructor() {
    this.prefs = Storage.getUserPrefs();
    this.init();
  }

  init() {
    this.updateThemeDisplay();
    this.updateAccentColorDisplay();
    
    // Ensure ThemeManager is loaded
    if (typeof ThemeManager !== 'undefined') {
      ThemeManager.init();
    }
  }

  setTheme(themeName) {
    if (typeof ThemeManager !== 'undefined') {
      ThemeManager.setTheme(themeName);
      this.updateThemeDisplay();
      UI.showToast(`Theme changed to ${ThemeManager.themes[themeName]?.name || themeName}!`, 'success');
    } else {
      UI.toggleTheme();
      this.updateThemeDisplay();
      UI.showToast('Theme updated!', 'success');
    }
  }

  updateThemeDisplay() {
    const prefs = Storage.getUserPrefs();
    const currentTheme = prefs.theme || 'light';
    
    // Update theme option buttons
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      const theme = btn.dataset.theme;
      if (theme === currentTheme) {
        btn.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      } else {
        btn.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
      }
    });
  }

  setAccentColor(color) {
    UI.setAccentColor(color);
    this.prefs.accentColor = color;
    Storage.saveUserPrefs(this.prefs);
    this.updateAccentColorDisplay();
    UI.showToast(`Accent color changed to ${color}!`, 'success');
  }

  updateAccentColorDisplay() {
    const prefs = Storage.getUserPrefs();
    const accentColor = prefs.accentColor || 'blue';
    
    document.querySelectorAll('.accent-color-btn').forEach(btn => {
      const color = btn.dataset.color;
      if (color === accentColor) {
        btn.classList.add('border-blue-600', 'ring-2', 'ring-blue-400');
        btn.classList.remove('border-transparent');
      } else {
        btn.classList.remove('border-blue-600', 'ring-2', 'ring-blue-400');
        btn.classList.add('border-transparent');
      }
    });
  }

  exportData() {
    const data = Storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studysaathi-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.showToast('Data exported successfully!', 'success');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        UI.confirm('Importing data will overwrite your current data. Continue?').then(confirmed => {
          if (confirmed) {
            const success = Storage.importData(data);
            if (success) {
              UI.showToast('Data imported successfully!', 'success');
              // Reload page to reflect changes
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              UI.showToast('Import failed. Please check the file format.', 'error');
            }
          }
        });
      } catch (error) {
        UI.showToast('Invalid file format. Please select a valid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  }

  clearAllData() {
    UI.confirm('Are you sure you want to clear ALL data? This action cannot be undone!').then(confirmed => {
      if (confirmed) {
        UI.confirm('Final confirmation: This will delete everything. Are you absolutely sure?').then(finalConfirm => {
          if (finalConfirm) {
            Storage.clearAll();
            UI.showToast('All data cleared. Reloading...', 'info');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      }
    });
  }
}

// Initialize settings manager
let settingsManager;
document.addEventListener('DOMContentLoaded', () => {
  settingsManager = new SettingsManager();
});

