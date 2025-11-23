// Onboarding system for StudySaathi 3.0
class Onboarding {
  static showWelcomeModal() {
    const prefs = Storage.getUserPrefs();
    
    // Check if onboarding already completed
    if (prefs.onboardingCompleted && prefs.userName) {
      return;
    }

    // Create welcome modal
    const modal = document.createElement('div');
    modal.id = 'welcome-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 scale-100">
        <div class="text-center mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-3xl">SS</span>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to StudySaathi! 👋</h2>
          <p class="text-gray-600 dark:text-gray-400">Let's personalize your experience</p>
        </div>
        
        <form id="welcome-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's your name?
            </label>
            <input
              type="text"
              id="user-name-input"
              required
              autocomplete="name"
              placeholder="Enter your name"
              class="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              autofocus
            >
          </div>
          
          <div class="flex flex-col space-y-3">
            <button
              type="submit"
              class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Let's Start! 🚀
            </button>
            <button
              type="button"
              onclick="Onboarding.skip()"
              class="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus on input
    setTimeout(() => {
      document.getElementById('user-name-input')?.focus();
    }, 100);

    // Handle form submission
    document.getElementById('welcome-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = document.getElementById('user-name-input').value.trim();
      if (userName) {
        Onboarding.complete(userName);
      }
    });

    // Add entrance animation
    setTimeout(() => {
      modal.querySelector('.scale-100').classList.add('scale-100');
    }, 10);
  }

  static complete(userName) {
    const prefs = Storage.getUserPrefs();
    prefs.userName = userName;
    prefs.onboardingCompleted = true;
    Storage.saveUserPrefs(prefs);

    // Animate modal out
    const modal = document.getElementById('welcome-modal');
    if (modal) {
      modal.querySelector('.scale-100').classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.remove();
        UI.showToast(`Welcome, ${userName}! Let's get productive! 🎉`, 'success');
        // Update dashboard if on index page
        if (typeof updateDashboard === 'function') {
          updateDashboard();
        }
      }, 300);
    }
  }

  static skip() {
    const prefs = Storage.getUserPrefs();
    prefs.userName = 'Student';
    prefs.onboardingCompleted = true;
    Storage.saveUserPrefs(prefs);

    const modal = document.getElementById('welcome-modal');
    if (modal) {
      modal.querySelector('.scale-100').classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  static getUserName() {
    const prefs = Storage.getUserPrefs();
    return prefs.userName || 'Student';
  }

  static getGreeting() {
    const hour = new Date().getHours();
    const userName = this.getUserName();
    
    if (hour < 12) {
      return `Good morning, ${userName}! ☀️`;
    } else if (hour < 17) {
      return `Good afternoon, ${userName}! 🌤️`;
    } else {
      return `Good evening, ${userName}! 🌙`;
    }
  }
}

// Show welcome modal on first visit
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Onboarding.showWelcomeModal(), 500);
  });
} else {
  setTimeout(() => Onboarding.showWelcomeModal(), 500);
}

