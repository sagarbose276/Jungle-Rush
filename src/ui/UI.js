import { soundFx } from '../audio/SoundEffects.js';

export class UI {
  constructor(callbacks) {
    this.callbacks = callbacks; // { onStart, onResume, onRestart, onPauseToggle }

    // Screen elements
    this.hud = document.getElementById('hud');
    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');

    // HUD values
    this.scoreDisplay = document.getElementById('score-display');
    this.coinsDisplay = document.getElementById('coins-display');
    this.speedDisplay = document.getElementById('speed-display');

    // Power-up HUD elements
    this.powerupHud = document.getElementById('powerup-hud');
    this.powerupIcon = document.getElementById('powerup-icon');
    this.powerupName = document.getElementById('powerup-name');
    this.powerupBarFill = document.getElementById('powerup-bar-fill');

    // Score / Menu elements
    this.startBestScore = document.getElementById('start-best-score');
    this.pauseScore = document.getElementById('pause-score');
    this.pauseCoins = document.getElementById('pause-coins');
    this.finalScore = document.getElementById('final-score');
    this.finalCoins = document.getElementById('final-coins');
    this.finalDistance = document.getElementById('final-distance');
    this.finalBestScore = document.getElementById('final-best-score');
    this.newHighScoreBadge = document.getElementById('new-high-score-badge');

    // Buttons
    this.playBtn = document.getElementById('play-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.resumeBtn = document.getElementById('resume-btn');
    this.restartFromPauseBtn = document.getElementById('restart-from-pause-btn');
    this.restartBtn = document.getElementById('restart-btn');

    this.bestScore = this.loadBestScore();
    this.updateStartBestScore();

    this.initButtons();
  }

  loadBestScore() {
    try {
      const val = localStorage.getItem('junglerush_best_score');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  saveBestScore(score) {
    if (score > this.bestScore) {
      this.bestScore = score;
      try {
        localStorage.setItem('junglerush_best_score', score.toString());
      } catch {
        // Storage fallback
      }
      return true; // New high score!
    }
    return false;
  }

  updateStartBestScore() {
    if (this.startBestScore) {
      this.startBestScore.textContent = this.bestScore.toLocaleString();
    }
  }

  initButtons() {
    const bind = (btn, action) => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          soundFx.init(); // Initialize audio context on first user interaction
          action();
        });
      }
    };

    bind(this.playBtn, () => {
      this.callbacks.onStart();
    });

    bind(this.pauseBtn, () => {
      this.callbacks.onPauseToggle();
    });

    bind(this.resumeBtn, () => {
      this.callbacks.onResume();
    });

    bind(this.restartFromPauseBtn, () => {
      this.callbacks.onRestart();
    });

    bind(this.restartBtn, () => {
      this.callbacks.onRestart();
    });

    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        soundFx.init();
        const isMuted = soundFx.toggleMute();
        this.soundBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }
  }

  showStartScreen() {
    this.hud.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
    this.updateStartBestScore();
  }

  showPlaying() {
    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  showPause(score, coins) {
    this.pauseScore.textContent = Math.floor(score).toLocaleString();
    this.pauseCoins.textContent = coins.toLocaleString();
    this.pauseScreen.classList.remove('hidden');
  }

  hidePause() {
    this.pauseScreen.classList.add('hidden');
  }

  showGameOver(score, coins, distance) {
    this.hud.classList.add('hidden');
    const isNewHigh = this.saveBestScore(Math.floor(score));

    this.finalScore.textContent = Math.floor(score).toLocaleString();
    this.finalCoins.textContent = coins.toLocaleString();
    this.finalDistance.textContent = `${Math.floor(distance)}m`;
    this.finalBestScore.textContent = this.bestScore.toLocaleString();

    if (isNewHigh) {
      this.newHighScoreBadge.classList.remove('hidden');
    } else {
      this.newHighScoreBadge.classList.add('hidden');
    }

    this.gameOverScreen.classList.remove('hidden');
  }

  updateHUD(score, coins, speedMultiplier, powerupStatus) {
    this.scoreDisplay.textContent = Math.floor(score).toLocaleString();
    this.coinsDisplay.textContent = coins.toLocaleString();
    this.speedDisplay.textContent = `${speedMultiplier.toFixed(1)}x`;

    // Power-up display
    if (powerupStatus) {
      this.powerupHud.classList.remove('hidden');
      if (powerupStatus.type === 'MAGNET') {
        this.powerupIcon.textContent = '🧲';
        this.powerupName.textContent = `COIN MAGNET (${Math.ceil(powerupStatus.timer)}s)`;
      } else if (powerupStatus.type === 'SHIELD') {
        this.powerupIcon.textContent = '🛡️';
        this.powerupName.textContent = `SHIELD ACTIVE (${Math.ceil(powerupStatus.timer)}s)`;
      } else if (powerupStatus.type === 'SPEED_BOOST') {
        this.powerupIcon.textContent = '⚡';
        this.powerupName.textContent = `SPEED BOOST (${Math.ceil(powerupStatus.timer)}s)`;
      }
      this.powerupBarFill.style.width = `${(powerupStatus.ratio * 100).toFixed(1)}%`;
    } else {
      this.powerupHud.classList.add('hidden');
    }
  }
}
