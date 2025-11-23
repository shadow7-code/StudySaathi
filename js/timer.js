// Pomodoro Timer functionality
class TimerManager {
  constructor() {
    this.mode = 'pomodoro'; // pomodoro, short, long, custom
    this.durations = {
      pomodoro: 25 * 60, // 25 minutes
      short: 5 * 60, // 5 minutes
      long: 15 * 60 // 15 minutes
    };
    this.timeLeft = this.durations[this.mode];
    this.isRunning = false;
    this.interval = null;
    this.totalTime = this.timeLeft;
    this.warningShown = false;
    this.updateStats();
    this.init();
    this.setupPageVisibilityListener();
  }

  init() {
    this.updateDisplay();
    this.setMode('pomodoro');
  }

  setMode(mode, customSeconds = null) {
    this.mode = mode;
    
    if (mode === 'custom' && customSeconds) {
      this.timeLeft = customSeconds;
      this.totalTime = customSeconds;
      this.durations.custom = customSeconds;
    } else {
      this.timeLeft = this.durations[mode];
      this.totalTime = this.timeLeft;
    }
    
    this.isRunning = false;
    this.warningShown = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    // Update active button (only for preset modes)
    if (mode !== 'custom') {
      document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById(`mode-${mode}`)?.classList.add('active');
    }
    
    // Update mode text
    const modeText = {
      pomodoro: 'Pomodoro',
      short: 'Short Break',
      long: 'Long Break',
      custom: 'Custom Timer'
    };
    const modeEl = document.getElementById('timer-mode');
    if (modeEl) {
      modeEl.textContent = modeText[mode] || mode;
    }
    
    this.updateDisplay();
    this.updateButton();
  }

  setCustomTime(minutes, seconds = 0) {
    const totalSeconds = (minutes * 60) + seconds;
    if (totalSeconds > 0) {
      this.setMode('custom', totalSeconds);
      UI.showToast(`Custom timer set to ${minutes}:${seconds.toString().padStart(2, '0')}`, 'success');
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
    this.updateButton();
    
    this.interval = setInterval(() => {
      this.timeLeft--;
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
    this.updateButton();
  }

  reset() {
    this.pause();
    if (this.mode === 'custom' && this.durations.custom) {
      this.timeLeft = this.durations.custom;
      this.totalTime = this.durations.custom;
    } else {
      this.timeLeft = this.durations[this.mode];
      this.totalTime = this.timeLeft;
    }
    this.updateDisplay();
    this.updateButton();
  }

  complete() {
    this.pause();
    
    // Play completion sound (optional - browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: `${this.mode === 'pomodoro' ? 'Take a break!' : 'Break is over. Time to focus!'}`,
        icon: '/favicon.ico'
      });
    }
    
    // Award XP and update stats
    if (this.mode === 'pomodoro') {
      Storage.addXP(25);
      const stats = Storage.getStats();
      const minutes = this.durations[this.mode] / 60;
      Storage.updateStats({
        totalStudyTime: (stats.totalStudyTime || 0) + minutes,
        sessionsCompleted: (stats.sessionsCompleted || 0) + 1
      });
      
      // Save session history
      Storage.addTimerSession({
        mode: this.mode,
        duration: this.durations[this.mode],
        completed: true
      });
      
      UI.showToast('Pomodoro complete! +25 XP', 'success');
      
      // Celebration effect on timer circle
      const timerCircle = document.getElementById('timer-circle');
      if (timerCircle) {
        UI.celebrate(timerCircle.parentElement);
      }
      
      // Check for achievements
      const sessionsCompleted = (stats.sessionsCompleted || 0) + 1;
      
      if (sessionsCompleted === 5) {
        UI.showAchievement('Study Streak! 📚', '5 Pomodoro sessions completed!');
      } else if (sessionsCompleted === 25) {
        UI.showAchievement('Focus Master! 🎯', '25 sessions done! Incredible focus!');
      } else if (sessionsCompleted === 100) {
        UI.showAchievement('Century Sessions! 🏆', '100 Pomodoro sessions! You\'re a productivity legend!');
      }
      
      // Update streak
      Storage.updateStreak();
    }
    
    // Auto-start break if pomodoro completed
    if (this.mode === 'pomodoro') {
      setTimeout(() => {
        this.setMode('short');
        this.start();
      }, 2000);
    } else {
      this.reset();
    }
    
    this.updateStats();
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timer-display').textContent = display;
    
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
    
    if (this.isRunning) {
      btnText.textContent = 'Pause';
    } else {
      btnText.textContent = this.timeLeft <= 0 ? 'Reset' : 'Start';
    }
  }

  updateStats() {
    const history = Storage.getTimerHistory();
    const today = new Date().toDateString();
    
    // Count today's sessions
    const todaySessions = history.filter(session => {
      const sessionDate = new Date(session.date).toDateString();
      return sessionDate === today && session.mode === 'pomodoro';
    }).length;
    
    document.getElementById('today-sessions').textContent = todaySessions;
    
    // Calculate total focus time
    const stats = Storage.getStats();
    const totalMinutes = stats.totalStudyTime || 0;
    const hours = Math.floor(totalMinutes / 60);
    document.getElementById('total-focus-time').textContent = hours > 0 ? `${hours}h` : `${totalMinutes}m`;
    
    // XP earned today
    const xp = Storage.getXP();
    document.getElementById('xp-earned').textContent = xp;
  }
}

// Setup page visibility listener for timer reminder
TimerManager.prototype.setupPageVisibilityListener = function() {
  let warningShown = false;
  const originalTitle = document.title;
  
  document.addEventListener('visibilitychange', () => {
    if (this.isRunning && document.hidden) {
      // User switched tabs/windows - show reminder
      if (!warningShown) {
        warningShown = true;
        
        // Update tab title to show timer is running
        const updateTabTitle = () => {
          if (this.isRunning && document.hidden) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            document.title = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')} - Timer Running!`;
            setTimeout(updateTabTitle, 1000);
          } else {
            document.title = originalTitle;
            warningShown = false;
          }
        };
        updateTabTitle();
        
        // Show notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⏱️ Timer is Running!', {
            body: 'Don\'t forget to come back and continue your study session!',
            icon: '/favicon.ico',
            tag: 'timer-reminder'
          });
        }
      }
    } else if (!document.hidden) {
      warningShown = false;
      document.title = document.title.replace(/^⏱️ \d+:\d+ - /, '') || originalTitle;
    }
  });
  
  // Warn user before leaving page if timer is running
  window.addEventListener('beforeunload', (e) => {
    if (this.isRunning) {
      e.preventDefault();
      e.returnValue = 'Your timer is still running! Are you sure you want to leave?';
      return e.returnValue;
    }
  });
};

// Manual timer input function
function showManualTimerInput() {
  const minutes = prompt('Enter minutes:', '25');
  const seconds = prompt('Enter seconds (0-59):', '0');
  
  if (minutes !== null && seconds !== null) {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    
    if (mins >= 0 && mins < 999 && secs >= 0 && secs < 60) {
      timerManager.setCustomTime(mins, secs);
    } else {
      if (typeof UI !== 'undefined') {
        UI.showToast('Invalid time! Minutes: 0-998, Seconds: 0-59', 'error');
      } else {
        alert('Invalid time! Minutes: 0-998, Seconds: 0-59');
      }
    }
  }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
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
        greetingEl.textContent = `Ready to focus, ${userName}? Let's start your Pomodoro session! 🍅`;
      }
    }
  }, 1000);
  
  // Update stats every minute
  setInterval(() => {
    timerManager.updateStats();
  }, 60000);
});

