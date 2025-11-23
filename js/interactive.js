// Interactive features for StudySaathi 3.0
class InteractiveFeatures {
  static init() {
    this.addTooltips();
    this.addProgressAnimations();
    this.addHoverEffects();
    this.addClickFeedback();
  }

  // Add helpful tooltips
  static addTooltips() {
    // Add tooltips to action buttons
    const buttons = document.querySelectorAll('button[title], a[title]');
    buttons.forEach(button => {
      if (!button.querySelector('.tooltip-text')) {
        const title = button.getAttribute('title');
        if (title) {
          button.classList.add('tooltip');
          const tooltip = document.createElement('span');
          tooltip.className = 'tooltip-text';
          tooltip.textContent = title;
          button.appendChild(tooltip);
          button.removeAttribute('title');
        }
      }
    });
  }

  // Add progress animations
  static addProgressAnimations() {
    const progressBars = document.querySelectorAll('[style*="width"]');
    progressBars.forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.transition = 'width 1s ease-in-out';
        bar.style.width = width;
      }, 100);
    });
  }

  // Add hover effects
  static addHoverEffects() {
    const cards = document.querySelectorAll('.bg-white, .dark\\:bg-gray-900');
    cards.forEach(card => {
      if (!card.classList.contains('no-hover-effect')) {
        card.addEventListener('mouseenter', function() {
          this.classList.add('shadow-xl', 'transform', 'scale-[1.02]');
          this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
          this.classList.remove('shadow-xl', 'transform', 'scale-[1.02]');
        });
      }
    });
  }

  // Add click feedback
  static addClickFeedback() {
    const clickableElements = document.querySelectorAll('button, a, .cursor-pointer');
    clickableElements.forEach(element => {
      element.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  // Show level up animation
  static showLevelUp(newLevel) {
    const levelUpModal = document.createElement('div');
    levelUpModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm';
    levelUpModal.innerHTML = `
      <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center transform scale-100 transition-all duration-500">
        <div class="text-6xl mb-4 bounce-animation">🎉</div>
        <h2 class="text-4xl font-bold text-white mb-2">Level Up!</h2>
        <p class="text-2xl text-white opacity-90 mb-6">You've reached Level ${newLevel}!</p>
        <button onclick="this.closest('.fixed').remove()" class="px-8 py-3 bg-white text-orange-500 rounded-2xl font-bold hover:shadow-xl transition-all duration-300">
          Awesome!
        </button>
      </div>
    `;
    
    document.body.appendChild(levelUpModal);
    UI.createConfetti(100);
    
    setTimeout(() => {
      levelUpModal.querySelector('.scale-100').classList.add('scale-95', 'opacity-0');
      setTimeout(() => levelUpModal.remove(), 500);
    }, 4000);
  }

  // Add typing indicator
  static showTypingIndicator(element) {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator flex space-x-2 p-4';
    indicator.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
    element.appendChild(indicator);
    return indicator;
  }
}

// Initialize interactive features
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => InteractiveFeatures.init(), 500);
  });
} else {
  setTimeout(() => InteractiveFeatures.init(), 500);
}

