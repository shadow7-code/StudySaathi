// Study Timer functionality
class TimerManager {
  constructor() {
    this.defaultDuration = 60 * 60; // 1 hour in seconds
    this.timeLeft = this.defaultDuration;
    this.isRunning = false;
    this.interval = null;
    this.totalTime = this.timeLeft;
    this.startTime = null;
    this.lastActiveTime = null;
    this.autoStopTimeout = null;
    this.updateStats();
    this.init();
    this.setupAutoStop();
  }

  init() {
    this.updateDisplay();
    // Load saved custom time if exists
    const savedTime = localStorage.getItem('studysaathi_timer_custom_time');
    if (savedTime) {
      const minutes = parseInt(savedTime);
      if (minutes > 0 && minutes <= 999) {
        this.setCustomTime(minutes, 0);
      }
    }
  }

  setCustomTime(minutes, seconds = 0) {
    const totalSeconds = (minutes * 60) + seconds;
    if (totalSeconds > 0 && totalSeconds <= 999 * 60) {
      this.timeLeft = totalSeconds;
      this.totalTime = totalSeconds;
      this.defaultDuration = totalSeconds;
      localStorage.setItem('studysaathi_timer_custom_time', minutes.toString());
      this.updateDisplay();
      this.updateButton();
      if (typeof UI !== 'undefined') {
        UI.showToast(`Timer set to ${minutes}:${seconds.toString().padStart(2, '0')}`, 'success');
      }
    }
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.timeLeft <= 0) {
      this.reset();
      return;
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastActiveTime = Date.now();
    this.updateButton();
    this.setupAutoStop();
    
    this.interval = setInterval(() => {
      this.timeLeft--;
      this.lastActiveTime = Date.now();
      this.updateDisplay();
      
      if (this.timeLeft <= 0) {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.clearAutoStop();
    this.updateButton();
  }

  reset() {
    this.pause();
    this.timeLeft = this.defaultDuration;
    this.totalTime = this.defaultDuration;
    this.updateDisplay();
    this.updateButton();
  }

  complete() {
    this.pause();
    
    // Calculate actual time studied (in case user paused/resumed)
    const actualMinutes = (this.totalTime - this.timeLeft) / 60;
    
    // Award XP and update stats
    const xpEarned = Math.floor(actualMinutes / 5); // 1 XP per 5 minutes
    if (xpEarned > 0) {
      Storage.addXP(xpEarned);
    }
    
    const stats = Storage.getStats();
    Storage.updateStats({
      totalStudyTime: (stats.totalStudyTime || 0) + actualMinutes,
      sessionsCompleted: (stats.sessionsCompleted || 0) + 1
    });
    
    // Save session history
    Storage.addTimerSession({
      mode: 'study',
      duration: this.totalTime - this.timeLeft,
      completed: true,
      date: new Date().toISOString()
    });
    
    if (typeof UI !== 'undefined') {
      UI.showToast(`Study session complete! +${xpEarned} XP`, 'success');
      
      // Celebration effect on timer circle
      const timerCircle = document.getElementById('timer-circle');
      if (timerCircle) {
        UI.celebrate(timerCircle.parentElement);
      }
    }
    
    // Update streak
    Storage.updateStreak();
    this.updateStats();
    this.reset();
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const displayEl = document.getElementById('timer-display');
    if (displayEl) {
      displayEl.textContent = display;
    }
    
    // Update circle progress
    const circumference = 2 * Math.PI * 120; // radius = 120
    const progress = (this.timeLeft / this.totalTime) * circumference;
    const circle = document.getElementById('timer-circle');
    if (circle) {
      circle.style.strokeDashoffset = circumference - progress;
    }
  }

  updateButton() {
    const btn = document.getElementById('start-pause-btn');
    const btnText = document.getElementById('btn-text');
    
    if (btn && btnText) {
      if (this.isRunning) {
        btnText.textContent = 'Pause';
      } else {
        btnText.textContent = this.timeLeft <= 0 ? 'Reset' : 'Start';
      }
    }
  }

  updateStats() {
    const history = Storage.getTimerHistory();
    const today = new Date().toDateString();
    
    // Count today's sessions
    const todaySessions = history.filter(session => {
      const sessionDate = new Date(session.date).toDateString();
      return sessionDate === today && session.completed;
    }).length;
    
    const todaySessionsEl = document.getElementById('today-sessions');
    if (todaySessionsEl) {
      todaySessionsEl.textContent = todaySessions;
    }
    
    // Calculate total focus time
    const stats = Storage.getStats();
    const totalMinutes = stats.totalStudyTime || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalFocusEl = document.getElementById('total-focus-time');
    if (totalFocusEl) {
      if (hours > 0) {
        totalFocusEl.textContent = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      } else {
        totalFocusEl.textContent = `${totalMinutes}m`;
      }
    }
    
    // XP earned
    const xp = Storage.getXP();
    const xpEarnedEl = document.getElementById('xp-earned');
    if (xpEarnedEl) {
      xpEarnedEl.textContent = xp;
    }
  }

  setupAutoStop() {
    this.clearAutoStop();
    
    if (!this.isRunning) return;
    
    // Set timeout to auto-stop after 1 hour of inactivity
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    this.autoStopTimeout = setTimeout(() => {
      // Check if timer is still running and no activity in last hour
      if (this.isRunning && this.lastActiveTime) {
        const timeSinceLastActive = Date.now() - this.lastActiveTime;
        if (timeSinceLastActive >= oneHour) {
          this.pause();
          if (typeof UI !== 'undefined') {
            UI.showToast('Timer auto-stopped due to inactivity', 'info');
          }
        }
      }
    }, oneHour);
  }

  clearAutoStop() {
    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = null;
    }
  }

  // Check activity on page visibility
  checkActivity() {
    if (this.isRunning) {
      this.lastActiveTime = Date.now();
      this.setupAutoStop();
    }
  }
}

// Initialize timer manager
let timerManager;
document.addEventListener('DOMContentLoaded', () => {
  timerManager = new TimerManager();
  
  // Update personalized greeting
  setTimeout(() => {
    if (typeof Onboarding !== 'undefined') {
      const greetingEl = document.getElementById('timer-greeting');
      if (greetingEl) {
        const userName = Onboarding.getUserName();
        greetingEl.textContent = `Ready to focus, ${userName}? Set your study timer and let's go! ⏱️`;
      }
    }
  }, 1000);
  
  // Check activity on page visibility
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && timerManager) {
      timerManager.checkActivity();
    }
  });
  
  // Update stats every minute
  setInterval(() => {
    if (timerManager) {
      timerManager.updateStats();
    }
  }, 60000);
});
