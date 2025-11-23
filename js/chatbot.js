// Chatbot functionality
class ChatbotManager {
  constructor() {
    const userName = typeof Onboarding !== 'undefined' ? Onboarding.getUserName() : 'Student';
    
    this.responses = {
      greeting: [
        `Hello ${userName}! How can I help you study today? 📚`,
        `Hi ${userName}! Ready to boost your productivity? 🚀`,
        `Hey ${userName}! Let's make today productive! 💪`
      ],
      focus: [
        'Here are some focus tips: 1) Use the Pomodoro technique (25 min study, 5 min break), 2) Remove distractions, 3) Find a quiet space, 4) Take deep breaths before starting. Try the breathing exercises! 🧘',
        'To stay focused: Break your work into smaller tasks, use the timer feature, avoid multitasking, and take regular breaks. The timer page has built-in Pomodoro sessions! ⏱️',
        'Focus better by: Creating a study schedule, eliminating phone distractions, using the study timer, and practicing mindfulness with breathing exercises. You\'ve got this! 💪'
      ],
      motivation: [
        'You\'re doing great! Every task you complete, every timer session you finish, you\'re building better habits. Keep going! 🌟',
        'Remember: Progress, not perfection! Every small step counts. Your current streak shows you\'re committed. Stay strong! 🔥',
        'You\'ve come this far, don\'t stop now! Your dedication is building momentum. Keep pushing forward, one session at a time! 💫',
        'Think about your goals. Every study session brings you closer. You\'re stronger than you think! Keep it up! 🎯'
      ],
      streak: [
        () => {
          const streak = Storage.getDailyStreak();
          return `Your current streak is ${streak.current} days! 🔥 Your longest streak is ${streak.longest} days. Keep it going!`;
        }
      ],
      tasks: [
        () => {
          const tasks = Storage.getTasks();
          const completed = tasks.filter(t => t.completed).length;
          const total = tasks.length;
          return `You've completed ${completed} out of ${total} tasks! ${total > 0 ? `That's ${Math.round((completed / total) * 100)}% completion rate.` : 'Great job!'} 🎉`;
        }
      ],
      xp: [
        () => {
          const xp = Storage.getXP();
          const level = Storage.getLevel();
          return `You have ${xp} XP and are at Level ${level}! Keep studying to level up! ⭐`;
        }
      ],
      time: [
        () => {
          const stats = Storage.getStats();
          const hours = Math.floor((stats.totalStudyTime || 0) / 60);
          const minutes = (stats.totalStudyTime || 0) % 60;
          return `You've studied for ${hours > 0 ? `${hours} hours and ${minutes} minutes` : `${minutes} minutes`} total! That's amazing dedication! 📊`;
        }
      ],
      help: [
        'I can help you with: study tips, motivation, checking your stats (streak, tasks, XP, study time), and general study advice. Just ask! 💬',
        'Try asking me about: how to stay focused, your current streak, completed tasks, your XP level, study time, or just ask for motivation! 🚀'
      ],
      default: [
        'I\'m not sure I understand. Try asking about your stats, study tips, or motivation! You can also check the quick questions below. 🤔',
        'Hmm, I didn\'t catch that. You can ask me about: your streak, tasks, XP, study time, or ask for study tips! 📚',
        'Could you rephrase that? I can help with study tips, motivation, or tell you about your progress! 💪'
      ]
    };
    this.init();
  }

  init() {
    // Scroll to bottom on load
    this.scrollToBottom();
    
    // Update personalized greeting
    if (typeof Onboarding !== 'undefined') {
      const greetingEl = document.getElementById('chatbot-greeting');
      if (greetingEl) {
        const userName = Onboarding.getUserName();
        greetingEl.textContent = `👋 Hello ${userName}! I'm your Study Assistant. I can help you with:`;
      }
    }
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    // Simulate typing delay
    setTimeout(() => {
      const response = this.getResponse(message);
      this.addMessage(response, 'bot');
    }, 500);
  }

  sendSuggestion(text) {
    document.getElementById('chat-input').value = text;
    this.sendMessage();
  }

  getResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return this.getRandomResponse(this.responses.greeting);
    }
    
    // Focus questions
    if (lowerMessage.match(/(focus|concentrate|distraction|stay focused|how to focus)/)) {
      return this.getRandomResponse(this.responses.focus);
    }
    
    // Motivation
    if (lowerMessage.match(/(motivat|encourage|inspiring|cheer|support|keep going)/)) {
      return this.getRandomResponse(this.responses.motivation);
    }
    
    // Streak
    if (lowerMessage.match(/(streak|current streak|how many days|daily streak)/)) {
      return this.getRandomResponse(this.responses.streak);
    }
    
    // Tasks
    if (lowerMessage.match(/(task|completed|how many tasks|tasks done|tasks completed)/)) {
      return this.getRandomResponse(this.responses.tasks);
    }
    
    // XP
    if (lowerMessage.match(/(xp|experience|level|points|how much xp)/)) {
      return this.getRandomResponse(this.responses.xp);
    }
    
    // Study time
    if (lowerMessage.match(/(study time|time studied|how long|minutes|hours)/)) {
      return this.getRandomResponse(this.responses.time);
    }
    
    // Help
    if (lowerMessage.match(/(help|what can you|what do you|assist|guide)/)) {
      return this.getRandomResponse(this.responses.help);
    }
    
    // Default
    return this.getRandomResponse(this.responses.default);
  }

  getRandomResponse(responses) {
    const response = responses[Math.floor(Math.random() * responses.length)];
    if (typeof response === 'function') {
      return response();
    }
    return response;
  }

  addMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start space-x-3 fade-in';
    
    if (sender === 'user') {
      messageDiv.innerHTML = `
        <div class="flex-1"></div>
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
          <p class="text-white">${this.escapeHtml(text)}</p>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold">SA</span>
        </div>
        <div class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
          <p class="text-gray-900 dark:text-white">${this.escapeHtml(text)}</p>
        </div>
      `;
    }
    
    container.appendChild(messageDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chatbot manager
let chatManager;
document.addEventListener('DOMContentLoaded', () => {
  chatManager = new ChatbotManager();
});

