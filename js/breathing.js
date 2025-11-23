// Breathing Exercises functionality
class BreathingManager {
  constructor() {
    this.isRunning = false;
    this.currentPhase = 'idle'; // idle, inhale, hold-in, exhale, hold-out
    this.timeout = null;
    this.currentTechnique = 'box'; // box, 478, deep, alternate
    this.techniques = {
      box: {
        inhale: 4,
        holdIn: 4,
        exhale: 4,
        holdOut: 4,
        name: 'Box Breathing'
      },
      '478': {
        inhale: 4,
        holdIn: 7,
        exhale: 8,
        holdOut: 0,
        name: '4-7-8 Method'
      },
      deep: {
        inhale: 5,
        holdIn: 0,
        exhale: 5,
        holdOut: 0,
        name: 'Deep Breathing'
      },
      alternate: {
        inhale: 6,
        holdIn: 6,
        exhale: 6,
        holdOut: 0,
        name: 'Alternate Nostril'
      }
    };
    this.init();
  }

  init() {
    this.updateDisplay();
  }

  setTechnique(technique) {
    if (this.isRunning) {
      this.stop();
    }
    this.currentTechnique = technique;
    this.updateDisplay();
    UI.showToast(`${this.techniques[technique].name} selected`, 'info');
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentPhase = 'inhale';
    document.getElementById('start-breathing-btn').classList.add('hidden');
    document.getElementById('stop-breathing-btn').classList.remove('hidden');
    
    this.cycle();
  }

  stop() {
    this.isRunning = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    this.currentPhase = 'idle';
    document.getElementById('start-breathing-btn').classList.remove('hidden');
    document.getElementById('stop-breathing-btn').classList.add('hidden');
    
    this.updateDisplay();
  }

  cycle() {
    if (!this.isRunning) return;
    
    const technique = this.techniques[this.currentTechnique];
    const circle = document.getElementById('breathing-circle');
    const text = document.getElementById('breathing-text');
    const instruction = document.getElementById('breathing-instruction');
    
    let duration;
    let scale;
    let textContent;
    let instructionText;
    
    switch (this.currentPhase) {
      case 'inhale':
        duration = technique.inhale * 1000;
        scale = 1.3;
        textContent = 'Inhale';
        instructionText = `Breathe in for ${technique.inhale} seconds`;
        this.currentPhase = technique.holdIn > 0 ? 'hold-in' : 'exhale';
        break;
        
      case 'hold-in':
        duration = technique.holdIn * 1000;
        scale = 1.3;
        textContent = 'Hold';
        instructionText = `Hold for ${technique.holdIn} seconds`;
        this.currentPhase = 'exhale';
        break;
        
      case 'exhale':
        duration = technique.exhale * 1000;
        scale = 1;
        textContent = 'Exhale';
        instructionText = `Breathe out for ${technique.exhale} seconds`;
        this.currentPhase = technique.holdOut > 0 ? 'hold-out' : 'inhale';
        break;
        
      case 'hold-out':
        duration = technique.holdOut * 1000;
        scale = 1;
        textContent = 'Hold';
        instructionText = `Hold for ${technique.holdOut} seconds`;
        this.currentPhase = 'inhale';
        break;
    }
    
    // Update circle animation
    if (circle) {
      circle.style.transform = `scale(${scale})`;
      circle.style.transition = `transform ${duration}ms ease-in-out`;
    }
    
    // Update text
    if (text) {
      text.textContent = textContent;
    }
    
    if (instruction) {
      instruction.textContent = instructionText;
    }
    
    // Continue cycle
    this.timeout = setTimeout(() => {
      if (this.isRunning) {
        this.cycle();
      }
    }, duration);
  }

  updateDisplay() {
    const technique = this.techniques[this.currentTechnique];
    const circle = document.getElementById('breathing-circle');
    
    if (circle && !this.isRunning) {
      circle.style.transform = 'scale(1)';
      circle.style.transition = 'transform 0.5s ease';
    }
    
    document.getElementById('breathing-text').textContent = 'Breathe';
    document.getElementById('breathing-instruction').textContent = 'Select a technique and start';
  }
}

// Initialize breathing manager
let breathingManager;
document.addEventListener('DOMContentLoaded', () => {
  breathingManager = new BreathingManager();
});

