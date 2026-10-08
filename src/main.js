import { GameManager } from './core/GameManager.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    window.game = new GameManager(canvas);
  }
});
