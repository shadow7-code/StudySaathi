// Exam Countdown functionality
class ExamManager {
  constructor() {
    this.exams = Storage.getExamDates();
    this.currentExamId = null;
    this.init();
  }

  init() {
    this.renderExams();
    // Update countdown every minute
    setInterval(() => {
      this.updateCountdowns();
    }, 60000);
  }

  showAddModal() {
    this.currentExamId = null;
    document.getElementById('exam-name').value = '';
    document.getElementById('exam-subject').value = '';
    document.getElementById('exam-date').value = '';
    document.getElementById('exam-location').value = '';
    document.getElementById('modal-title').textContent = 'Add Exam';
    document.getElementById('delete-exam-btn').classList.add('hidden');
    document.getElementById('exam-modal').classList.remove('hidden');
    document.getElementById('exam-modal').classList.add('flex');
  }

  editExam(id) {
    const exam = this.exams.find(e => e.id === id);
    if (!exam) return;

    this.currentExamId = id;
    document.getElementById('exam-name').value = exam.name;
    document.getElementById('exam-subject').value = exam.subject || '';
    document.getElementById('exam-location').value = exam.location || '';
    
    // Format datetime for input
    const date = new Date(exam.date);
    const dateTimeLocal = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('exam-date').value = dateTimeLocal;
    
    document.getElementById('modal-title').textContent = 'Edit Exam';
    document.getElementById('delete-exam-btn').classList.remove('hidden');
    document.getElementById('exam-modal').classList.remove('hidden');
    document.getElementById('exam-modal').classList.add('flex');
  }

  closeModal() {
    document.getElementById('exam-modal').classList.add('hidden');
    document.getElementById('exam-modal').classList.remove('flex');
    this.currentExamId = null;
  }

  saveExam() {
    const name = document.getElementById('exam-name').value.trim();
    const subject = document.getElementById('exam-subject').value.trim();
    const date = document.getElementById('exam-date').value;
    const location = document.getElementById('exam-location').value.trim();

    if (!name || !date) {
      UI.showToast('Please fill in required fields', 'error');
      return;
    }

    if (this.currentExamId) {
      // Update existing exam
      const exam = this.exams.find(e => e.id === this.currentExamId);
      if (exam) {
        exam.name = name;
        exam.subject = subject;
        exam.date = new Date(date).toISOString();
        exam.location = location;
        exam.updatedAt = new Date().toISOString();
      }
    } else {
      // Create new exam
      const exam = {
        id: Date.now().toString(),
        name,
        subject,
        date: new Date(date).toISOString(),
        location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.exams.push(exam);
    }

    Storage.saveExamDates(this.exams);
    this.closeModal();
    this.renderExams();
    UI.showToast('Exam saved!', 'success');
  }

  deleteExam() {
    if (!this.currentExamId) return;

    UI.confirm('Are you sure you want to delete this exam?').then(confirmed => {
      if (confirmed) {
        this.exams = this.exams.filter(e => e.id !== this.currentExamId);
        Storage.saveExamDates(this.exams);
        this.closeModal();
        this.renderExams();
        UI.showToast('Exam deleted', 'info');
      }
    });
  }

  getTimeRemaining(date) {
    const now = new Date();
    const examDate = new Date(date);
    const diff = examDate - now;

    if (diff <= 0) {
      return { passed: true, days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { passed: false, days, hours, minutes };
  }

  updateCountdowns() {
    this.renderExams();
  }

  getUrgencyColor(exam) {
    const timeRemaining = this.getTimeRemaining(exam.date);
    
    if (timeRemaining.passed) {
      return 'bg-gray-100 dark:bg-gray-800';
    }
    
    if (timeRemaining.days <= 7) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    } else if (timeRemaining.days <= 30) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
    
    return 'bg-white dark:bg-gray-900';
  }

  renderExams() {
    const container = document.getElementById('exams-container');
    if (!container) return;

    // Sort exams by date
    const sortedExams = [...this.exams].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    if (sortedExams.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-4">No exams scheduled</p>
          <button
            onclick="examManager.showAddModal()"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Add Your First Exam
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = sortedExams.map(exam => {
      const timeRemaining = this.getTimeRemaining(exam.date);
      const urgencyColor = this.getUrgencyColor(exam);
      
      return `
        <div class="${urgencyColor} rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 fade-in transform hover:scale-[1.02] border-2 ${timeRemaining.days <= 7 && !timeRemaining.passed ? 'border-red-300 dark:border-red-700 ring-2 ring-red-500' : timeRemaining.days <= 30 && !timeRemaining.passed ? 'border-yellow-300 dark:border-yellow-700' : 'border-transparent'}">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${this.escapeHtml(exam.name)}</h3>
              ${exam.subject ? `<p class="text-sm text-gray-600 dark:text-gray-400">${this.escapeHtml(exam.subject)}</p>` : ''}
            </div>
            <div class="flex items-center space-x-2">
              <button
                onclick="examManager.editExam('${exam.id}')"
                class="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-110 transition-all duration-200"
                title="Edit exam"
              >
                <svg class="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
          
          ${timeRemaining.passed ? `
            <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 text-center">
              <p class="text-lg font-bold text-gray-600 dark:text-gray-400">✅ Exam Passed</p>
            </div>
          ` : `
            <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-center text-white mb-4 transform hover:scale-105 transition-transform duration-200 shadow-lg">
              <div class="text-3xl md:text-4xl font-bold mb-1 animate-pulse">
                ${timeRemaining.days > 0 ? `${timeRemaining.days}${timeRemaining.days === 1 ? ' day' : ' days'}` : 
                  timeRemaining.hours > 0 ? `${timeRemaining.hours}${timeRemaining.hours === 1 ? ' hour' : ' hours'}` :
                  `${timeRemaining.minutes}${timeRemaining.minutes === 1 ? ' minute' : ' minutes'}`}
              </div>
              <p class="text-sm opacity-90">${timeRemaining.days > 0 ? `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining` : 
                timeRemaining.hours > 0 ? `${timeRemaining.minutes}m remaining` : 'Less than a minute'}</p>
              ${timeRemaining.days <= 7 ? `
                <div class="mt-2 pt-2 border-t border-white/20">
                  <p class="text-xs opacity-90">⚠️ Study hard! Time is running out!</p>
                </div>
              ` : ''}
            </div>
          `}
          
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>${UI.formatDate(exam.date)}</span>
            </div>
            ${exam.location ? `
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>${this.escapeHtml(exam.location)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize exam manager
let examManager;
document.addEventListener('DOMContentLoaded', () => {
  examManager = new ExamManager();
});

