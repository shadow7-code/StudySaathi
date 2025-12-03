// Analytics feature for dashboard
class TaskAnalytics {
  static updateDisplay() {
    const tasks = Storage.getTasks();
    const stats = Storage.getStats();
    const timerHistory = Storage.getTimerHistory();
    const streak = Storage.getDailyStreak();

    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const pending = total - completed;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.setText('completion-rate', `${completionRate}%`);

    this.setText('analytics-study-time', this.formatDuration(stats.totalStudyTime || 0));
    this.setText('analytics-pending-tasks', pending);
    this.setText('analytics-focus-sessions', stats.sessionsCompleted || 0);

    const productivityScore = this.calculateProductivityScore(tasks, stats);
    this.setText('productivity-score', productivityScore);

    const weeklyStats = this.getWeeklyStats(timerHistory);
    this.setText('analytics-weekly-time', this.formatDuration(weeklyStats.weeklyMinutes));
    this.setText('analytics-avg-session', weeklyStats.avgSessionMinutes > 0 ? `${weeklyStats.avgSessionMinutes}m` : '0m');
    this.setText('analytics-goal-progress', `${weeklyStats.goalProgress}%`);
    this.setBarWidth('analytics-goal-bar', weeklyStats.goalProgress);
    this.setText('analytics-today-sessions', weeklyStats.todaySessions);
    this.setText('analytics-streak', `${streak.current || 0}d`);

    this.renderPendingList(tasks);
  }

  static setText(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }

  static setBarWidth(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.style.width = `${value}%`;
    }
  }

  static formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '0m';
    if (minutes >= 60) {
      const hours = minutes / 60;
      return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
    }
    return `${Math.round(minutes)}m`;
  }

  static getWeeklyStats(history) {
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - 6);

    let weeklySeconds = 0;
    let sessionsThisWeek = 0;
    let sessionsToday = 0;

    history.forEach(session => {
      if (session.mode !== 'study') return;
      const sessionDate = new Date(session.date);
      if (sessionDate >= weekStart) {
        weeklySeconds += session.duration || 0;
        sessionsThisWeek += 1;
        if (sessionDate.toDateString() === today.toDateString()) {
          sessionsToday += 1;
        }
      }
    });

    const weeklyMinutes = Math.round(weeklySeconds / 60);
    const avgSessionMinutes = sessionsThisWeek > 0 ? Math.max(1, Math.round((weeklySeconds / sessionsThisWeek) / 60)) : 0;
    const goalHours = 10;
    const weeklyHours = weeklyMinutes / 60;
    const goalProgress = goalHours > 0 ? Math.min(Math.round((weeklyHours / goalHours) * 100), 100) : 0;

    return {
      weeklyMinutes,
      avgSessionMinutes,
      todaySessions: sessionsToday,
      goalProgress
    };
  }

  static renderPendingList(tasks) {
    const listEl = document.getElementById('analytics-pending-list');
    const countEl = document.getElementById('analytics-pending-count');
    if (!listEl) return;

    const pendingTasks = tasks.filter(t => !t.completed);
    if (countEl) {
      const label = pendingTasks.length === 1 ? 'pending task' : 'pending tasks';
      countEl.textContent = `${pendingTasks.length} ${label}`;
    }

    if (pendingTasks.length === 0) {
      listEl.innerHTML = `
        <div class="p-4 rounded-2xl bg-white/5 text-white/80">
          <p class="text-sm font-medium">You're all caught up 🎉</p>
          <p class="text-xs text-white/60 mt-1">Add new tasks or pick a fresh focus.</p>
        </div>
      `;
      return;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const topTasks = pendingTasks
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : null;
        const dateB = b.dueDate ? new Date(b.dueDate) : null;
        if (dateA && dateB) return dateA - dateB;
        if (dateA) return -1;
        if (dateB) return 1;
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      })
      .slice(0, 3);

    listEl.innerHTML = topTasks.map(task => {
      const dueLabel = task.dueDate
        ? `Due ${UI.formatDate(task.dueDate)}`
        : `Added ${UI.getRelativeTime(task.createdAt)}`;
      const priorityLabel = (task.priority || 'medium');
      const pillClass = this.getPriorityBadge(priorityLabel);
      return `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
          <div>
            <p class="text-sm font-semibold text-white">${task.title}</p>
            <p class="text-xs text-white/70">${dueLabel}</p>
          </div>
          <span class="${pillClass}">${priorityLabel.charAt(0).toUpperCase() + priorityLabel.slice(1)}</span>
        </div>
      `;
    }).join('');
  }

  static getPriorityBadge(priority = 'medium') {
    const map = {
      high: 'px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-100 border border-red-400/30',
      medium: 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-100 border border-yellow-300/30',
      low: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-100 border border-green-300/30'
    };
    return map[priority] || map.medium;
  }

  static calculateProductivityScore(tasks, stats = {}) {
    if (tasks.length === 0) return 0;

    let score = 0;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = completed / tasks.length;
    score += completionRate * 50;

    const highPriorityCompleted = tasks.filter(t => t.priority === 'high' && t.completed).length;
    const totalHigh = tasks.filter(t => t.priority === 'high').length;
    if (totalHigh > 0) {
      score += (highPriorityCompleted / totalHigh) * 25;
    }

    const categories = ['theory', 'lab', 'assignment', 'study', 'project', 'extra'];
    const usedCategories = categories.filter(category => tasks.some(task => task.category === category));
    score += Math.min(usedCategories.length * 4, 20);

    const sessions = stats.sessionsCompleted || 0;
    score += Math.min(sessions, 20);

    return Math.min(Math.round(score), 100);
  }
}


