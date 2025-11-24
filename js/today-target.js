class TodayTarget {
  static getTarget() {
    const target = localStorage.getItem('studysaathi_today_target');
    const today = new Date().toDateString();
    
    if (target) {
      const data = JSON.parse(target);
      // Reset if it's a new day
      if (data.date !== today) {
        return {
          theory: 0,
          lab: 0,
          assignment: 0,
          study: 0,
          project: 0,
          extra: 0,
          date: today
        };
      }
      return data;
    }
    
    return {
      theory: 0,
      lab: 0,
      assignment: 0,
      study: 0,
      project: 0,
      extra: 0,
      date: today
    };
  }

  static saveTarget(target) {
    const today = new Date().toDateString();
    target.date = today;
    localStorage.setItem('studysaathi_today_target', JSON.stringify(target));
  }

  static getCompleted() {
    const tasks = Storage.getTasks();
    const today = new Date().toDateString();
    
    const completed = {
      theory: 0,
      lab: 0,
      assignment: 0,
      study: 0,
      project: 0,
      extra: 0
    };
    
    tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const completedDate = new Date(task.completedAt).toDateString();
        if (completedDate === today && task.category) {
          completed[task.category] = (completed[task.category] || 0) + 1;
        }
      }
    });
    
    return completed;
  }

  static updateDisplay() {
    const target = this.getTarget();
    const completed = this.getCompleted();
    
    // Update target numbers for all categories
    const categories = ['theory', 'lab', 'assignment', 'study', 'project', 'extra'];
    
    categories.forEach(category => {
      const el = document.getElementById(`target-${category}`);
      if (el) el.textContent = target[category] || 0;
    });
    
    // Calculate progress
    const totalTarget = categories.reduce((sum, cat) => sum + (target[cat] || 0), 0);
    const totalCompleted = categories.reduce((sum, cat) => sum + (completed[cat] || 0), 0);
    
    const progressEl = document.getElementById('target-progress-text');
    const progressBar = document.getElementById('target-progress-bar');
    
    if (progressEl && progressBar) {
      if (totalTarget > 0) {
        const progress = Math.min((totalCompleted / totalTarget) * 100, 100);
        progressEl.textContent = `${Math.round(progress)}%`;
        progressBar.style.width = `${progress}%`;
      } else {
        progressEl.textContent = '0%';
        progressBar.style.width = '0%';
      }
    }
  }
}

// Show target modal
function showTargetModal() {
  const target = TodayTarget.getTarget();
  
  const categories = [
    { key: 'theory', label: 'Theory Tasks' },
    { key: 'lab', label: 'Lab Tasks' },
    { key: 'assignment', label: 'Assignment Tasks' },
    { key: 'study', label: 'Study Tasks' },
    { key: 'project', label: 'Project Tasks' },
    { key: 'extra', label: 'Extra Tasks' }
  ];
  
  categories.forEach(cat => {
    const input = prompt(`Set ${cat.label} Target:`, target[cat.key] || 0);
    if (input !== null) {
      target[cat.key] = parseInt(input) || 0;
    }
  });
  
  TodayTarget.saveTarget(target);
  TodayTarget.updateDisplay();
  UI.showToast('Target updated!', 'success');
}