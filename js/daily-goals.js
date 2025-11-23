// Daily Goals feature for StudySaathi 3.0
class DailyGoals {
  static getGoals() {
    const goals = localStorage.getItem('studysaathi_daily_goals');
    return goals ? JSON.parse(goals) : {
      pomodoroSessions: 4,
      tasksToComplete: 5,
      notesToCreate: 2,
      lastReset: new Date().toDateString()
    };
  }

  static saveGoals(goals) {
    localStorage.setItem('studysaathi_daily_goals', JSON.stringify(goals));
  }

  static checkAndReset() {
    const goals = this.getGoals();
    const today = new Date().toDateString();
    
    if (goals.lastReset !== today) {
      // Reset daily goals
      goals.lastReset = today;
      goals.completed = {
        pomodoroSessions: 0,
        tasksCompleted: 0,
        notesCreated: 0
      };
      this.saveGoals(goals);
    }
    
    return goals;
  }

  static getProgress() {
    const goals = this.checkAndReset();
    const stats = Storage.getStats();
    
    // Get today's completed items
    const today = new Date().toDateString();
    const history = Storage.getTimerHistory();
    const todaySessions = history.filter(s => {
      const sessionDate = new Date(s.date).toDateString();
      return sessionDate === today && s.mode === 'pomodoro';
    }).length;
    
    const tasks = Storage.getTasks();
    const todayTasks = tasks.filter(t => {
      if (!t.completedAt) return false;
      return new Date(t.completedAt).toDateString() === today;
    }).length;
    
    const notes = Storage.getNotes();
    const todayNotes = notes.filter(n => {
      return new Date(n.createdAt).toDateString() === today;
    }).length;
    
    return {
      pomodoro: {
        current: todaySessions,
        target: goals.pomodoroSessions,
        percentage: Math.min((todaySessions / goals.pomodoroSessions) * 100, 100)
      },
      tasks: {
        current: todayTasks,
        target: goals.tasksToComplete,
        percentage: Math.min((todayTasks / goals.tasksToComplete) * 100, 100)
      },
      notes: {
        current: todayNotes,
        target: goals.notesToCreate,
        percentage: Math.min((todayNotes / goals.notesToCreate) * 100, 100)
      }
    };
  }

  static updateGoal(type, value) {
    const goals = this.getGoals();
    goals[type] = parseInt(value) || 0;
    this.saveGoals(goals);
    return goals;
  }
}

