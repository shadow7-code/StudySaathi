// Distraction Blocker feature
class DistractionBlocker {
  static isActive = false;
  static blockedSites = ['facebook.com', 'youtube.com', 'twitter.com', 'instagram.com', 'reddit.com', 'tiktok.com'];
  static startTime = null;
  static endTime = null;

  static init() {
    this.loadSettings();
    this.updateUI();
  }

  static loadSettings() {
    const settings = localStorage.getItem('studysaathi_distraction_blocker');
    if (settings) {
      const data = JSON.parse(settings);
      this.isActive = data.isActive || false;
      this.blockedSites = data.blockedSites || this.blockedSites;
    }
  }

  static saveSettings() {
    localStorage.setItem('studysaathi_distraction_blocker', JSON.stringify({
      isActive: this.isActive,
      blockedSites: this.blockedSites
    }));
  }

  static toggle() {
    this.isActive = !this.isActive;
    
    if (this.isActive) {
      this.startTime = new Date();
      this.activateBlocking();
      if (typeof UI !== 'undefined') {
        UI.showToast('Distraction blocker activated! 🚫', 'success');
      }
    } else {
      this.endTime = new Date();
      this.deactivateBlocking();
      if (typeof UI !== 'undefined') {
        UI.showToast('Distraction blocker deactivated', 'info');
      }
    }
    
    this.saveSettings();
    this.updateUI();
  }

  static activateBlocking() {
    // Create overlay
    if (!document.getElementById('distraction-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'distraction-overlay';
      overlay.className = 'fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center';
      overlay.innerHTML = `
        <div class="text-center text-white p-8">
          <div class="text-6xl mb-4">🚫</div>
          <h2 class="text-3xl font-bold mb-4">Stay Focused!</h2>
          <p class="text-xl mb-6 opacity-90">You're in a focused study session</p>
          <p class="text-sm opacity-70 mb-8">Block distraction blocker to continue browsing</p>
          <button 
            onclick="DistractionBlocker.toggle()"
            class="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-2xl font-bold transition-colors"
          >
            Deactivate Blocker
          </button>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    
    // Monitor for attempts to open blocked sites
    this.checkBlockedSites();
    
    // Prevent context menu
    document.addEventListener('contextmenu', this.preventContextMenu);
    document.addEventListener('keydown', this.preventKeyboardShortcuts);
  }

  static deactivateBlocking() {
    const overlay = document.getElementById('distraction-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    document.removeEventListener('contextmenu', this.preventContextMenu);
    document.removeEventListener('keydown', this.preventKeyboardShortcuts);
  }

  static preventContextMenu(e) {
    if (DistractionBlocker.isActive) {
      e.preventDefault();
      UI.showToast('Distraction blocker is active! 🚫', 'warning');
      return false;
    }
  }

  static preventKeyboardShortcuts(e) {
    if (!DistractionBlocker.isActive) return;
    
    // Block common shortcuts that might open distractions
    const blocked = [
      { key: 't', ctrl: true, shift: false }, // New tab
      { key: 'n', ctrl: true }, // New window
      { key: 'w', ctrl: true, shift: true }, // New incognito window
    ];
    
    const matched = blocked.some(b => 
      e.ctrlKey === (b.ctrl || false) && 
      e.shiftKey === (b.shift || false) && 
      e.key.toLowerCase() === b.key
    );
    
    if (matched) {
      e.preventDefault();
      UI.showToast('Stay focused! Distraction blocker is active 🚫', 'warning');
    }
  }

  static checkBlockedSites() {
    // Check current URL
    const currentHost = window.location.hostname.toLowerCase();
    const isBlocked = this.blockedSites.some(site => currentHost.includes(site));
    
    if (isBlocked && this.isActive) {
      // Redirect to focus page or show warning
      this.showDistractionWarning();
    }
  }

  static showDistractionWarning() {
    const warning = document.createElement('div');
    warning.className = 'fixed inset-0 z-[10000] bg-red-600 flex items-center justify-center p-4';
    warning.innerHTML = `
      <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div class="text-6xl mb-4">🚫</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Distraction Detected!</h2>
        <p class="text-gray-600 mb-6">This site is blocked during your study session.</p>
        <p class="text-sm text-gray-500 mb-8">Stay focused and return to your studies!</p>
        <button 
          onclick="window.location.href='index.html'"
          class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
        >
          Return to StudySaathi
        </button>
      </div>
    `;
    document.body.appendChild(warning);
  }

  static updateUI() {
    const toggleBtn = document.getElementById('distraction-toggle');
    const statusEl = document.getElementById('blocker-status');
    
    if (toggleBtn) {
      if (this.isActive) {
        toggleBtn.textContent = '🚫 Deactivate Blocker';
        toggleBtn.className = 'px-6 py-3 bg-white bg-opacity-20 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-opacity-30 transition-all duration-300 hover:scale-110';
      } else {
        toggleBtn.textContent = '✅ Activate Blocker';
        toggleBtn.className = 'px-6 py-3 bg-white bg-opacity-20 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-opacity-30 transition-all duration-300 hover:scale-110';
      }
    }
    
    if (statusEl) {
      const status = this.getStatus();
      statusEl.textContent = status.isActive 
        ? `Status: Active (${status.duration} min)` 
        : 'Status: Inactive';
    }
  }

  static getStatus() {
    return {
      isActive: this.isActive,
      startTime: this.startTime,
      duration: this.startTime ? Math.floor((new Date() - this.startTime) / 1000 / 60) : 0
    };
  }
}

// Initialize distraction blocker
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DistractionBlocker.init());
} else {
  DistractionBlocker.init();
}

