class TodayTarget {
  static getTarget() {
    const target = localStorage.getItem('studysaathi_today_target_v2');
    const today = new Date().toDateString();
    
    if (target) {
      const data = JSON.parse(target);
      // Reset if it's a new day
      if (data.date !== today) {
        return {
          date: today,
          taskIds: []
        };
      }
      return data;
    }
    
    return {
      date: today,
      taskIds: []
    };
  }

  static saveTarget(target) {
    const today = new Date().toDateString();
    target.date = today;
    localStorage.setItem('studysaathi_today_target_v2', JSON.stringify(target));
  }

  static updateDisplay() {
    const target = this.getTarget();
    const tasks = Storage.getTasks();
    const pendingTasks = tasks.filter(t => !t.completed);
    const validIds = target.taskIds.filter(id => pendingTasks.some(task => task.id === id));

    if (validIds.length !== target.taskIds.length) {
      target.taskIds = validIds;
      this.saveTarget(target);
    }

    const selectedTasks = pendingTasks.filter(t => validIds.includes(t.id));

    // Update compact summary text
    const summaryEl = document.getElementById('today-target-summary');
    if (summaryEl) {
      if (selectedTasks.length === 0) {
        summaryEl.textContent = 'Tap to choose a few focus tasks for today';
      } else if (selectedTasks.length === 1) {
        summaryEl.textContent = `1 focus task locked in`;
      } else {
        summaryEl.textContent = `${selectedTasks.length} focus tasks selected`;
      }
    }

    // Render selected tasks list (below the header, like recent activity)
    const listEl = document.getElementById('today-target-selected');
    if (!listEl) return;

    if (selectedTasks.length === 0) {
      listEl.innerHTML = `
        <div class="flex items-center space-x-4 p-4 rounded-2xl bg-white/5">
          <div class="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <span class="text-lg">🎯</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-white/90">No focus tasks yet</p>
            <p class="text-xs text-white/70">Pick a few important tasks for today</p>
          </div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = selectedTasks.map(task => `
      <div class="flex items-center space-x-4 p-4 rounded-2xl bg-white/5">
        <div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-white">${task.title}</p>
          ${task.category ? `<p class="text-xs text-blue-100 capitalize">${task.category}</p>` : ''}
        </div>
      </div>
    `).join('');
  }
}

// Expand / collapse and select tasks for today's target
function showTargetModal() {
  const panel = document.getElementById('today-target-panel');
  const toggle = document.getElementById('today-target-toggle');
  const chevron = document.getElementById('today-target-chevron');
  if (!panel) return;

  const closePanel = () => {
    panel.classList.add('hidden');
    toggle?.setAttribute('aria-expanded', 'false');
    chevron?.classList.remove('rotate-180');
  };

  const openPanel = () => {
    panel.classList.remove('hidden');
    toggle?.setAttribute('aria-expanded', 'true');
    chevron?.classList.add('rotate-180');
  };

  if (!panel.classList.contains('hidden')) {
    closePanel();
    return;
  }

  const target = TodayTarget.getTarget();
  const tasks = Storage.getTasks().filter(t => !t.completed);
  const listEl = document.getElementById('today-target-task-options');

  if (!listEl) return;

  if (tasks.length === 0) {
    listEl.innerHTML = `
      <p class="text-sm text-white/80">No pending tasks available. Create a task first.</p>
    `;
  } else {
    listEl.innerHTML = tasks.map(task => `
      <label class="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
        <div class="flex flex-col">
          <span class="text-sm font-medium text-white">${task.title}</span>
          ${task.category ? `<span class="text-xs text-blue-100 capitalize">${task.category}</span>` : ''}
        </div>
        <input 
          type="checkbox" 
          class="w-4 h-4 rounded border-white/40 bg-transparent"
          value="${task.id}"
          ${target.taskIds.includes(task.id) ? 'checked' : ''}
        />
      </label>
    `).join('');
  }

  // Wire up buttons
  const saveBtn = document.getElementById('today-target-save');
  const cancelBtn = document.getElementById('today-target-cancel');

  if (saveBtn) {
    saveBtn.onclick = () => {
      const checked = Array.from(listEl.querySelectorAll('input[type="checkbox"]:checked'));
      const taskIds = checked.map(c => c.value);
      TodayTarget.saveTarget({ taskIds });
      TodayTarget.updateDisplay();
      closePanel();
      if (typeof UI !== 'undefined') {
        UI.showToast('Today\'s focus updated ✨', 'success');
      }
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      closePanel();
    };
  }

  openPanel();
}