// Today Target feature for StudySaathi 3.0
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
          date: today
        };
      }
      return data;
    }
    
    return {
      theory: 0,
      lab: 0,
      assignment: 0,
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
      assignment: 0
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
    
    // Update target numbers (only if elements exist - they're on index.html)
    const theoryEl = document.getElementById('target-theory');
    const labEl = document.getElementById('target-lab');
    const assignmentEl = document.getElementById('target-assignment');
    
    if (theoryEl) theoryEl.textContent = target.theory || 0;
    if (labEl) labEl.textContent = target.lab || 0;
    if (assignmentEl) assignmentEl.textContent = target.assignment || 0;
    
    // Calculate progress
    const totalTarget = (target.theory || 0) + (target.lab || 0) + (target.assignment || 0);
    const totalCompleted = (completed.theory || 0) + (completed.lab || 0) + (completed.assignment || 0);
    
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
  
  const theory = prompt('Set Theory Tasks Target:', target.theory || 0);
  if (theory !== null) {
    target.theory = parseInt(theory) || 0;
  }
  
  const lab = prompt('Set Lab Tasks Target:', target.lab || 0);
  if (lab !== null) {
    target.lab = parseInt(lab) || 0;
  }
  
  const assignment = prompt('Set Assignment Target:', target.assignment || 0);
  if (assignment !== null) {
    target.assignment = parseInt(assignment) || 0;
  }
  
  TodayTarget.saveTarget(target);
  TodayTarget.updateDisplay();
  UI.showToast('Target updated!', 'success');
}

