// UI utilities and shared components
class UI {
  static init() {
    this.initTheme();
    this.initNavbar();
    this.initSidebar();
  }

  // Theme Management
  static initTheme() {
    const prefs = Storage.getUserPrefs();
    const theme = prefs.theme || 'light';
    const accentColor = prefs.accentColor || 'blue';
    
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-accent', accentColor);
  }

  static toggleTheme() {
    const prefs = Storage.getUserPrefs();
    const currentTheme = prefs.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    prefs.theme = newTheme;
    Storage.saveUserPrefs(prefs);
    
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }

  static setAccentColor(color) {
    const prefs = Storage.getUserPrefs();
    prefs.accentColor = color;
    Storage.saveUserPrefs(prefs);
    document.documentElement.setAttribute('data-accent', color);
  }

  // Navbar
  static initNavbar() {
    const navToggle = document.getElementById('nav-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        sidebar?.classList.toggle('translate-x-0');
        sidebar?.classList.toggle('-translate-x-full');
      });
    }
  }

  // Sidebar
  static initSidebar() {
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => {
        sidebar?.classList.add('-translate-x-full');
        sidebar?.classList.remove('translate-x-0');
      });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 768) {
        if (sidebar && !sidebar.contains(e.target) && 
            !e.target.closest('#nav-toggle') && 
            sidebar.classList.contains('translate-x-0')) {
          sidebar.classList.add('-translate-x-full');
          sidebar.classList.remove('translate-x-0');
        }
      }
    });
  }

  // Toast notifications
  static showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-300 translate-x-0`;
    
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-yellow-500 text-white'
    };
    
    toast.className += ` ${colors[type] || colors.info}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Format time
  static formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Format date
  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get relative time
  static getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Confirm dialog
  static async confirm(message) {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      dialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <p class="text-gray-800 dark:text-gray-200 mb-6">${message}</p>
          <div class="flex gap-3 justify-end">
            <button class="cancel-btn px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Cancel
            </button>
            <button class="confirm-btn px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">
              Confirm
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      dialog.querySelector('.cancel-btn').onclick = () => {
        dialog.remove();
        resolve(false);
      };
      
      dialog.querySelector('.confirm-btn').onclick = () => {
        dialog.remove();
        resolve(true);
      };
    });
  }

  // Loading state
  static setLoading(element, isLoading) {
    if (isLoading) {
      element.disabled = true;
      element.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      element.disabled = false;
      element.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // Animate element
  static animateElement(element, animation = 'fade-in') {
    element.classList.add(animation);
    setTimeout(() => {
      element.classList.remove(animation);
    }, 500);
  }

  // Celebration effect
  static celebrate(element) {
    if (element) {
      element.classList.add('celebration');
      setTimeout(() => {
        element.classList.remove('celebration');
      }, 600);
    }
    this.createConfetti();
  }

  // Create confetti effect
  static createConfetti(count = 50) {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.remove();
        }, 4000);
      }, i * 20);
    }
  }

  // Show achievement notification
  static showAchievement(title, message) {
    const achievement = document.createElement('div');
    achievement.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-4 shadow-2xl transform transition-all duration-500 translate-x-0 max-w-sm';
    achievement.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-3xl">🏆</div>
        <div>
          <h3 class="font-bold text-lg">${title}</h3>
          <p class="text-sm opacity-90">${message}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(achievement);
    
    // Animate in
    setTimeout(() => {
      achievement.classList.add('scale-100');
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
      achievement.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => achievement.remove(), 500);
    }, 4000);
  }
}

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UI.init());
} else {
  UI.init();
}

