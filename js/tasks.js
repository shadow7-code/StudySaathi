// Task Manager functionality
class TaskManager {
  constructor() {
    this.tasks = Storage.getTasks();
    this.filter = 'active'; // active, completed
    this.init();
  }

  init() {
    this.renderTasks();
    this.setupEventListeners();
    this.setupEditModal();
  }

  setupEditModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('edit-task-modal')) {
      const modal = document.createElement('div');
      modal.id = 'edit-task-modal';
      modal.className = 'hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl max-w-sm w-full">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Task</h2>
          
          <form id="edit-task-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Name</label>
              <input 
                type="text" 
                id="edit-task-title" 
                required
                class="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter task name..."
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <input 
                type="date" 
                id="edit-task-due-date"
                class="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Save
              </button>
              <button 
                type="button"
                id="cancel-edit-btn"
                class="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const modal = document.getElementById('edit-task-modal');
    const form = document.getElementById('edit-task-form');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    // Close modal on cancel
    cancelBtn.addEventListener('click', () => this.closeEditModal());

    // Close modal on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeEditModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.closeEditModal();
      }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEditedTask();
    });
  }

  openEditModal(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('edit-task-modal');
    const titleInput = document.getElementById('edit-task-title');
    const dueDateInput = document.getElementById('edit-task-due-date');

    titleInput.value = task.title;
    dueDateInput.value = task.dueDate ? task.dueDate.split('T')[0] : '';

    // Store current task id for saving
    modal.dataset.taskId = taskId;

    modal.classList.remove('hidden');
    titleInput.focus();
  }

  closeEditModal() {
    const modal = document.getElementById('edit-task-modal');
    modal.classList.add('hidden');
    modal.dataset.taskId = '';
  }

  saveEditedTask() {
    const modal = document.getElementById('edit-task-modal');
    const taskId = modal.dataset.taskId;
    const titleInput = document.getElementById('edit-task-title');
    const dueDateInput = document.getElementById('edit-task-due-date');

    const title = titleInput.value.trim();
    if (!title) {
      UI.showToast('Task title cannot be empty', 'error');
      return;
    }

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.title = title;
    task.dueDate = dueDateInput.value || null;

    Storage.saveTasks(this.tasks);
    this.renderTasks();
    this.closeEditModal();
    UI.showToast('Task updated successfully!', 'success');
  }

  setupEventListeners() {
    // Add task form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addTask();
      });
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filter = e.target.dataset.filter;
        this.renderTasks();
      });
    });
  }

  addTask() {
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const priorityInput = document.getElementById('task-priority');
    const dueDateInput = document.getElementById('task-due-date');
    const categoryInput = document.querySelector('input[name="task-category"]:checked');

    const title = titleInput.value.trim();
    if (!title) {
      UI.showToast('Please enter a task title', 'error');
      return;
    }

    // Auto-detect priority based on due date when adding task
    let finalPriority = priorityInput.value || 'medium';
    const dueDate = dueDateInput.value || null;
    if (dueDate) {
      const now = new Date();
      const deadline = new Date(dueDate);
      const diff = deadline - now;
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      // Auto-detect priority based on time remaining
      if (daysLeft < 2) {
        finalPriority = 'high';
      } else if (daysLeft < 4) {
        finalPriority = 'medium';
      } else {
        finalPriority = 'low';
      }
    }

    const task = {
      id: Date.now().toString(),
      title,
      description: descriptionInput.value.trim(),
      priority: finalPriority,
      dueDate: dueDate,
      category: categoryInput ? categoryInput.value : 'theory',
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      xpAwarded: false
    };

    this.tasks.unshift(task);
    Storage.saveTasks(this.tasks);
    
    titleInput.value = '';
    descriptionInput.value = '';
    priorityInput.value = 'medium';
    dueDateInput.value = '';
    
    // Reset category to theory
    const theoryRadio = document.getElementById('category-theory');
    if (theoryRadio) theoryRadio.checked = true;

    this.renderTasks();
    UI.showToast('Task added successfully!', 'success');
    Storage.addXP(5);
    // Any study-related activity should contribute to streak
    Storage.updateStreak();

    // Close the form after adding task
    const formContainer = document.getElementById('task-form-container');
    if (formContainer) {
      formContainer.classList.add('hidden');
    }

    // Update Today Target display
    if (typeof TodayTarget !== 'undefined') {
      TodayTarget.updateDisplay();
    }

    // Update Analytics display
    if (typeof TaskAnalytics !== 'undefined') {
      TaskAnalytics.updateDisplay();
    }
  }

  deleteTask(id) {
    UI.confirm('Are you sure you want to delete this task?').then(confirmed => {
      if (confirmed) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        Storage.saveTasks(this.tasks);
        this.renderTasks();
        UI.showToast('Task deleted', 'info');
      }
    });
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      const wasCompleted = task.completed;
      
      // When completing a task, freeze the current effective priority BEFORE marking as completed
      if (!wasCompleted && !task.completed) {
        // Get the effective priority while task is still incomplete
        let currentEffectivePriority = task.priority;
        if (task.dueDate) {
          const now = new Date();
          const deadline = new Date(task.dueDate);
          const diff = deadline - now;
          const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
          
          // Calculate current effective priority
          if (daysLeft < 2) {
            currentEffectivePriority = 'high';
          } else if (daysLeft < 4) {
            currentEffectivePriority = 'medium';
          } else {
            currentEffectivePriority = 'low';
          }
        }
        // Freeze the priority by saving it
        task.priority = currentEffectivePriority;
      }
      
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      
      // Award XP and stats only the first time a task is completed
      if (!wasCompleted && task.completed && !task.xpAwarded) {
        task.xpAwarded = true;
        Storage.addXP(10);
        Storage.updateStats({ tasksCompleted: (Storage.getStats().tasksCompleted || 0) + 1 });
        UI.showToast('Task completed! +10 XP', 'success');
        
        // Celebration effect
        const taskElement = event.target.closest('.bg-white, .dark\\:bg-gray-900');
        if (taskElement) {
          UI.celebrate(taskElement);
        }
        
        // Update Today Target
        if (typeof TodayTarget !== 'undefined') {
          TodayTarget.updateDisplay();
        }

        // Update Analytics
        if (typeof TaskAnalytics !== 'undefined') {
          TaskAnalytics.updateDisplay();
        }

        // Check for achievements
        const stats = Storage.getStats();
        const tasksCompleted = stats.tasksCompleted || 0;
        
        if (tasksCompleted === 10) {
          UI.showAchievement('Milestone Unlocked! 🎉', 'You\'ve completed 10 tasks!');
        } else if (tasksCompleted === 50) {
          UI.showAchievement('Amazing Progress! 🌟', '50 tasks completed! You\'re unstoppable!');
        } else if (tasksCompleted === 100) {
          UI.showAchievement('Century Club! 💯', '100 tasks completed! Incredible dedication!');
        }
        
        // Update streak for genuine completion
        Storage.updateStreak();
      }
      
      Storage.saveTasks(this.tasks);
      this.renderTasks();
    }
  }

  getEffectivePriority(task) {
    // If task is completed, always use the saved priority (fixed)
    if (task.completed) return task.priority;
    
    // For incomplete tasks, dynamically calculate priority based on due date
    if (!task.dueDate) return task.priority;
    
    const now = new Date();
    const deadline = new Date(task.dueDate);
    const diff = deadline - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    // Auto-update priority based on time remaining (only for incomplete tasks)
    if (daysLeft < 2) {
      return 'high';
    } else if (daysLeft < 4) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getFilteredTasks() {
    let filtered;
    if (this.filter === 'active') {
      filtered = this.tasks.filter(t => !t.completed);
    } else if (this.filter === 'completed') {
      filtered = this.tasks.filter(t => t.completed);
    } else {
      // Default to active if filter is invalid
      this.filter = 'active';
      filtered = this.tasks.filter(t => !t.completed);
    }
    
    // Sort by completion status first (incomplete above, completed below), then by effective priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return filtered.sort((a, b) => {
      // Incomplete tasks (false) come before completed tasks (true) - ALWAYS
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Only sort by priority if both have same completion status
      const priorityA = this.getEffectivePriority(a);
      const priorityB = this.getEffectivePriority(b);
      return priorityOrder[priorityA] - priorityOrder[priorityB];
    });
  }

  getPriorityColor(priority) {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[priority] || colors.medium;
  }

  getPriorityBorderAndGradient(priority) {
    const styles = {
      high: {
        border: 'border-l-4 border-red-500',
        gradient: 'from-red-500/15 via-red-500/8 via-50% to-transparent dark:from-red-500/25 dark:via-red-500/12'
      },
      medium: {
        border: 'border-l-4 border-yellow-500',
        gradient: 'from-yellow-500/15 via-yellow-500/8 via-50% to-transparent dark:from-yellow-500/25 dark:via-yellow-500/12'
      },
      low: {
        border: 'border-l-4 border-green-500',
        gradient: 'from-green-500/15 via-green-500/8 via-50% to-transparent dark:from-green-500/25 dark:via-green-500/12'
      }
    };
    return styles[priority] || styles.medium;
  }

  getDeadlineStatusColor(priority) {
    const colors = {
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white'
    };
    return colors[priority] || 'bg-blue-500 text-white';
  }

  getCategoryColor(category) {
    const colors = {
      theory: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      lab: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      assignment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      study: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      project: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      extra: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    };
    return colors[category] || colors.theory;
  }

  getDeadlineStatus(dueDate) {
    if (!dueDate) return null;
    
    const now = new Date();
    const deadline = new Date(dueDate);
    const diff = deadline - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { status: 'overdue', days: Math.abs(daysLeft), color: 'bg-red-500 text-white' };
    } else if (daysLeft === 0) {
      return { status: 'today', days: 0, color: 'bg-orange-500 text-white' };
    } else if (daysLeft <= 3) {
      return { status: 'urgent', days: daysLeft, color: 'bg-yellow-500 text-white' };
    } else if (daysLeft <= 7) {
      return { status: 'soon', days: daysLeft, color: 'bg-blue-500 text-white' };
    } else {
      return { status: 'upcoming', days: daysLeft, color: 'bg-green-500 text-white' };
    }
  }

  renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">No tasks found</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredTasks.map(task => {
      const deadlineStatus = !task.completed ? this.getDeadlineStatus(task.dueDate) : null;
      const effectivePriority = this.getEffectivePriority(task); // Dynamic for incomplete, fixed for completed
      const priorityStyle = this.getPriorityBorderAndGradient(effectivePriority);
      const deadlineStatusColor = deadlineStatus ? this.getDeadlineStatusColor(effectivePriority) : null;
      
      return `
      <div class="bg-gradient-to-r ${priorityStyle.gradient} bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 fade-in transform hover:scale-[1.02] ${task.completed ? 'opacity-40' : ''} ${deadlineStatus && deadlineStatus.status === 'overdue' ? 'ring-2 ring-red-500' : ''} ${priorityStyle.border}">
        <div class="flex items-start space-x-4">
          <button onclick="taskManager.toggleTask('${task.id}')" class="mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center transition-all duration-200 hover:scale-125 hover:shadow-md">
            ${task.completed ? `
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            ` : ''}
          </button>
          
          <div class="flex-1 min-w-0 w-full">
            <div class="flex items-start justify-between mb-3 flex-wrap gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white ${task.completed ? 'line-through' : ''} break-words">${task.title}</h3>
              
              <div class="flex flex-wrap items-center gap-2">
                ${deadlineStatus ? `
                  <span class="px-3 py-1 rounded-xl text-xs font-bold ${deadlineStatusColor} animate-pulse whitespace-nowrap">
                    ${deadlineStatus.status === 'overdue' ? `⚠️ Overdue by ${deadlineStatus.days} days` : 
                      deadlineStatus.status === 'today' ? '⚠️ Due Today!' :
                      deadlineStatus.status === 'urgent' ? `⏰ ${deadlineStatus.days} days left` :
                      deadlineStatus.status === 'soon' ? `📅 ${deadlineStatus.days} days left` :
                      `${deadlineStatus.days} days left`}
                  </span>
                ` : ''}
                ${task.category ? `
                  <span class="px-3 py-1 rounded-xl text-xs font-medium ${this.getCategoryColor(task.category)}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                ` : ''}
                <span class="px-3 py-1 rounded-xl text-xs font-medium ${this.getPriorityColor(effectivePriority)}">
                  ${effectivePriority.charAt(0).toUpperCase() + effectivePriority.slice(1)}
                </span>
              </div>
            </div>
            
            ${task.description ? `<p class="text-gray-600 dark:text-gray-400 mb-3 text-sm">${task.description}</p>` : ''}
            
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                ${task.dueDate ? `
                  <div class="flex items-center space-x-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>${UI.formatDate(task.dueDate)}</span>
                  </div>
                ` : ''}
                <span class="text-xs">${UI.getRelativeTime(task.createdAt)}</span>
              </div>
              
              <div class="flex items-center space-x-2 justify-start">
                ${!task.completed ? `
                  <button onclick="taskManager.openEditModal('${task.id}')" class="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-110 transition-all duration-200">
                    <svg class="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                ` : ''}
                <button onclick="taskManager.deleteTask('${task.id}')" class="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-200">
                  <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join('');
  }
}

// Initialize task manager
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
  taskManager = new TaskManager();
});