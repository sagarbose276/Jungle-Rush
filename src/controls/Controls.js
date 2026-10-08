export class Controls {
  constructor(onAction) {
    this.onAction = onAction; // Callback: (action) => void ('left', 'right', 'jump', 'slide', 'pause')
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.minSwipeDistance = 30; // Min px to qualify as swipe
    this.maxSwipeTime = 500; // Max ms

    this.initKeyboard();
    this.initTouch();
    this.initTouchButtons();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser default scroll for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.trigger('left');
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.trigger('right');
          break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          this.trigger('jump');
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.trigger('slide');
          break;
        case 'Escape':
        case 'KeyP':
          this.trigger('pause');
          break;
      }
    });
  }

  initTouch() {
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        if (deltaTime <= this.maxSwipeTime) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (Math.max(absX, absY) > this.minSwipeDistance) {
            if (absX > absY) {
              // Horizontal swipe
              if (deltaX > 0) {
                this.trigger('right');
              } else {
                this.trigger('left');
              }
            } else {
              // Vertical swipe
              if (deltaY < 0) {
                this.trigger('jump');
              } else {
                this.trigger('slide');
              }
            }
          }
        }
      }
    }, { passive: true });
  }

  initTouchButtons() {
    const bindBtn = (id, action) => {
      const btn = document.getElementById(id);
      if (btn) {
        const handler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.trigger(action);
        };
        btn.addEventListener('touchstart', handler, { passive: false });
        btn.addEventListener('mousedown', handler);
      }
    };

    bindBtn('touch-left', 'left');
    bindBtn('touch-right', 'right');
    bindBtn('touch-jump', 'jump');
    bindBtn('touch-slide', 'slide');
  }

  trigger(action) {
    if (typeof this.onAction === 'function') {
      this.onAction(action);
    }
  }
}
