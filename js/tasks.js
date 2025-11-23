// Task Manager functionality
class TaskManager {
  constructor() {
    this.tasks = Storage.getTasks();
    this.filter = 'all'; // all, active, completed
    this.init();
  }

  init() {
    this.renderTasks();
    this.setupEventListeners();
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

    const task = {
      id: Date.now().toString(),
      title,
      description: descriptionInput.value.trim(),
      priority: priorityInput.value || 'medium',
      dueDate: dueDateInput.value || null,
      category: categoryInput ? categoryInput.value : 'theory',
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
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
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      
      if (task.completed) {
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
        
        // Update streak
        Storage.updateStreak();
      }
      
      Storage.saveTasks(this.tasks);
      this.renderTasks();
    }
  }

  editTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const title = prompt('Edit task title:', task.title);
    if (title && title.trim()) {
      task.title = title.trim();
      const description = prompt('Edit task description:', task.description || '');
      task.description = description.trim();
      Storage.saveTasks(this.tasks);
      this.renderTasks();
      UI.showToast('Task updated', 'success');
    }
  }

  getFilteredTasks() {
    if (this.filter === 'active') {
      return this.tasks.filter(t => !t.completed);
    } else if (this.filter === 'completed') {
      return this.tasks.filter(t => t.completed);
    }
    return this.tasks;
  }

  getPriorityColor(priority) {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[priority] || colors.medium;
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
      
      return `
      <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 fade-in transform hover:scale-[1.02] ${task.completed ? 'opacity-60' : ''} ${deadlineStatus && deadlineStatus.status === 'overdue' ? 'ring-2 ring-red-500' : ''}">
        <div class="flex items-start space-x-4">
          <button onclick="taskManager.toggleTask('${task.id}')" class="mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center transition-all duration-200 hover:scale-125 hover:shadow-md">
            ${task.completed ? `
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            ` : ''}
          </button>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2 flex-wrap gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white ${task.completed ? 'line-through' : ''}">${task.title}</h3>
              <div class="flex items-center space-x-2">
                ${deadlineStatus ? `
                  <span class="px-3 py-1 rounded-xl text-xs font-bold ${deadlineStatus.color} animate-pulse">
                    ${deadlineStatus.status === 'overdue' ? `⚠️ Overdue by ${deadlineStatus.days} days` : 
                      deadlineStatus.status === 'today' ? '⚠️ Due Today!' :
                      deadlineStatus.status === 'urgent' ? `⏰ ${deadlineStatus.days} days left` :
                      deadlineStatus.status === 'soon' ? `📅 ${deadlineStatus.days} days left` :
                      `${deadlineStatus.days} days left`}
                  </span>
                ` : ''}
                ${task.category ? `
                  <span class="px-3 py-1 rounded-xl text-xs font-medium ${
                    task.category === 'theory' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    task.category === 'lab' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                  }">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                ` : ''}
                <span class="px-3 py-1 rounded-xl text-xs font-medium ${this.getPriorityColor(task.priority)}">${task.priority}</span>
              </div>
            </div>
            
            ${task.description ? `<p class="text-gray-600 dark:text-gray-400 mb-3 text-sm">${task.description}</p>` : ''}
            
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
              
              <div class="flex items-center space-x-2">
                ${!task.completed ? `
                  <button onclick="taskManager.editTask('${task.id}')" class="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-110 transition-all duration-200" title="Edit task">
                    <svg class="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                ` : ''}
                <button onclick="taskManager.deleteTask('${task.id}')" class="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-200" title="Delete task">
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

