// Analytics feature for dashboard
class TaskAnalytics {
  static updateDisplay() {
    const tasks = Storage.getTasks();

    // Task completion stats
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const total = tasks.length;

    // Priority distribution
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;

    // Category distribution
    const theory = tasks.filter(t => t.category === 'theory').length;
    const lab = tasks.filter(t => t.category === 'lab').length;
    const assignment = tasks.filter(t => t.category === 'assignment').length;

    // Update completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const completionEl = document.getElementById('completion-rate');
    if (completionEl) completionEl.textContent = `${completionRate}%`;

    // Update total tasks
    const totalTasksEl = document.getElementById('total-tasks');
    if (totalTasksEl) totalTasksEl.textContent = total;

    // Update completed tasks
    const completedTasksEl = document.getElementById('completed-tasks');
    if (completedTasksEl) completedTasksEl.textContent = completed;

    // Update priority stats
    const highTasksEl = document.getElementById('high-priority-tasks');
    const mediumTasksEl = document.getElementById('medium-priority-tasks');
    const lowTasksEl = document.getElementById('low-priority-tasks');

    if (highTasksEl) highTasksEl.textContent = high;
    if (mediumTasksEl) mediumTasksEl.textContent = medium;
    if (lowTasksEl) lowTasksEl.textContent = low;

    // Update category stats
    const theoryTasksEl = document.getElementById('theory-tasks');
    const labTasksEl = document.getElementById('lab-tasks');
    const assignmentTasksEl = document.getElementById('assignment-tasks');

    if (theoryTasksEl) theoryTasksEl.textContent = theory;
    if (labTasksEl) labTasksEl.textContent = lab;
    if (assignmentTasksEl) assignmentTasksEl.textContent = assignment;

    // Calculate productivity score (simple algorithm)
    const productivityScore = this.calculateProductivityScore(tasks);
    const scoreEl = document.getElementById('productivity-score');
    if (scoreEl) scoreEl.textContent = productivityScore;

    // Update progress bars
    this.updateProgressBars(total, completed, high, medium, low, theory, lab, assignment);
  }

  static calculateProductivityScore(tasks) {
    if (tasks.length === 0) return 0;

    let score = 0;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = completed / tasks.length;

    // Base score from completion rate
    score += completionRate * 50;

    // Bonus for high-priority tasks completion
    const highPriorityCompleted = tasks.filter(t => t.priority === 'high' && t.completed).length;
    const totalHigh = tasks.filter(t => t.priority === 'high').length;
    if (totalHigh > 0) {
      score += (highPriorityCompleted / totalHigh) * 30;
    }

    // Bonus for balanced workload
    const theoryTasks = tasks.filter(t => t.category === 'theory').length;
    const labTasks = tasks.filter(t => t.category === 'lab').length;
    const assignmentTasks = tasks.filter(t => t.category === 'assignment').length;

    const categories = [theoryTasks, labTasks, assignmentTasks].filter(c => c > 0).length;
    score += categories * 10; // Bonus for using multiple categories

    return Math.min(Math.round(score), 100);
  }

  static updateProgressBars(total, completed, high, medium, low, theory, lab, assignment) {
    // Completion progress bar
    const completionBar = document.getElementById('completion-progress-bar');
    if (completionBar && total > 0) {
      const completionPercent = (completed / total) * 100;
      completionBar.style.width = `${completionPercent}%`;
    }

    // Priority distribution bars
    const totalPriority = high + medium + low;
    if (totalPriority > 0) {
      const highBar = document.getElementById('high-priority-bar');
      const mediumBar = document.getElementById('medium-priority-bar');
      const lowBar = document.getElementById('low-priority-bar');

      if (highBar) highBar.style.width = `${(high / totalPriority) * 100}%`;
      if (mediumBar) mediumBar.style.width = `${(medium / totalPriority) * 100}%`;
      if (lowBar) lowBar.style.width = `${(low / totalPriority) * 100}%`;
    }

    // Category distribution bars
    const totalCategory = theory + lab + assignment;
    if (totalCategory > 0) {
      const theoryBar = document.getElementById('theory-bar');
      const labBar = document.getElementById('lab-bar');
      const assignmentBar = document.getElementById('assignment-bar');

      if (theoryBar) theoryBar.style.width = `${(theory / totalCategory) * 100}%`;
      if (labBar) labBar.style.width = `${(lab / totalCategory) * 100}%`;
      if (assignmentBar) assignmentBar.style.width = `${(assignment / totalCategory) * 100}%`;
    }
  }
}
