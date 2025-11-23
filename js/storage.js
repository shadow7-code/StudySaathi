// Storage utility for StudySaathi 3.0
class Storage {
  static keys = {
    TASKS: 'studysaathi_tasks',
    NOTES: 'studysaathi_notes',
    TIMER_HISTORY: 'studysaathi_timer_history',
    EXAM_DATES: 'studysaathi_exam_dates',
    USER_PREFS: 'studysaathi_user_prefs',
    DAILY_STREAK: 'studysaathi_daily_streak',
    XP: 'studysaathi_xp',
    STATS: 'studysaathi_stats'
  };

  // Tasks
  static getTasks() {
    const tasks = localStorage.getItem(this.keys.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  }

  static saveTasks(tasks) {
    localStorage.setItem(this.keys.TASKS, JSON.stringify(tasks));
  }

  // Notes
  static getNotes() {
    const notes = localStorage.getItem(this.keys.NOTES);
    return notes ? JSON.parse(notes) : [];
  }

  static saveNotes(notes) {
    localStorage.setItem(this.keys.NOTES, JSON.stringify(notes));
  }

  // Timer History
  static getTimerHistory() {
    const history = localStorage.getItem(this.keys.TIMER_HISTORY);
    return history ? JSON.parse(history) : [];
  }

  static saveTimerHistory(history) {
    localStorage.setItem(this.keys.TIMER_HISTORY, JSON.stringify(history));
  }

  static addTimerSession(session) {
    const history = this.getTimerHistory();
    history.push({
      ...session,
      date: new Date().toISOString()
    });
    this.saveTimerHistory(history);
  }

  // Exam Dates
  static getExamDates() {
    const exams = localStorage.getItem(this.keys.EXAM_DATES);
    return exams ? JSON.parse(exams) : [];
  }

  static saveExamDates(exams) {
    localStorage.setItem(this.keys.EXAM_DATES, JSON.stringify(exams));
  }

  // User Preferences
  static getUserPrefs() {
    const prefs = localStorage.getItem(this.keys.USER_PREFS);
    return prefs ? JSON.parse(prefs) : {
      theme: 'light',
      accentColor: 'blue',
      notifications: true,
      soundEnabled: true,
      userName: '',
      onboardingCompleted: false
    };
  }

  static saveUserPrefs(prefs) {
    localStorage.setItem(this.keys.USER_PREFS, JSON.stringify(prefs));
  }

  // Daily Streak
  static getDailyStreak() {
    const streak = localStorage.getItem(this.keys.DAILY_STREAK);
    return streak ? JSON.parse(streak) : {
      current: 0,
      longest: 0,
      lastDate: null
    };
  }

  static updateStreak() {
    const streak = this.getDailyStreak();
    const today = new Date().toDateString();
    
    if (streak.lastDate === today) {
      return streak; // Already updated today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (streak.lastDate === yesterday.toDateString()) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }

    if (streak.current > streak.longest) {
      streak.longest = streak.current;
    }

    streak.lastDate = today;
    localStorage.setItem(this.keys.DAILY_STREAK, JSON.stringify(streak));
    return streak;
  }

  // XP System
  static getXP() {
    const xp = localStorage.getItem(this.keys.XP);
    return xp ? parseInt(xp) : 0;
  }

  static addXP(amount) {
    const currentXP = this.getXP();
    const newXP = currentXP + amount;
    localStorage.setItem(this.keys.XP, newXP.toString());
    return newXP;
  }

  static getLevel() {
    const xp = this.getXP();
    return Math.floor(xp / 100) + 1;
  }

  static getXPForNextLevel() {
    const level = this.getLevel();
    return level * 100;
  }

  // Stats
  static getStats() {
    const stats = localStorage.getItem(this.keys.STATS);
    return stats ? JSON.parse(stats) : {
      tasksCompleted: 0,
      totalStudyTime: 0,
      notesCreated: 0,
      sessionsCompleted: 0
    };
  }

  static updateStats(updates) {
    const stats = this.getStats();
    Object.assign(stats, updates);
    localStorage.setItem(this.keys.STATS, JSON.stringify(stats));
    return stats;
  }

  // Export all data
  static exportData() {
    return {
      tasks: this.getTasks(),
      notes: this.getNotes(),
      timerHistory: this.getTimerHistory(),
      examDates: this.getExamDates(),
      userPrefs: this.getUserPrefs(),
      streak: this.getDailyStreak(),
      xp: this.getXP(),
      stats: this.getStats(),
      exportDate: new Date().toISOString()
    };
  }

  // Import data
  static importData(data) {
    try {
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.notes) this.saveNotes(data.notes);
      if (data.timerHistory) this.saveTimerHistory(data.timerHistory);
      if (data.examDates) this.saveExamDates(data.examDates);
      if (data.userPrefs) this.saveUserPrefs(data.userPrefs);
      if (data.streak) localStorage.setItem(this.keys.DAILY_STREAK, JSON.stringify(data.streak));
      if (data.xp) localStorage.setItem(this.keys.XP, data.xp.toString());
      if (data.stats) localStorage.setItem(this.keys.STATS, JSON.stringify(data.stats));
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Clear all data
  static clearAll() {
    Object.values(this.keys).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

