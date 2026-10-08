import * as THREE from 'three';
import { Player } from '../entities/Player.js';
import { Obstacles } from '../world/Obstacles.js';
import { Coins } from '../world/Coins.js';
import { PowerUps } from '../world/PowerUps.js';
import { World } from '../world/World.js';
import { Controls } from '../controls/Controls.js';
import { UI } from '../ui/UI.js';
import { soundFx } from '../audio/SoundEffects.js';

export class GameManager {
  constructor(canvas) {
    this.canvas = canvas;

    // Game States: 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.state = 'START';

    // Metrics
    this.forwardDistance = 0;
    this.baseSpeed = 19;
    this.maxSpeed = 38;
    this.currentSpeed = this.baseSpeed;
    this.coinsCollected = 0;
    this.score = 0;

    // Camera follow & Screen shake
    this.cameraShake = 0;
    this.cameraOffset = new THREE.Vector3(0, 3.8, -7.2);
    this.cameraLookAhead = 8.0;

    // Setup Three.js Scene
    this.initScene();
    this.initLights();

    // Instantiate Subsystems
    this.player = new Player(this.scene);
    this.obstacles = new Obstacles(this.scene);
    this.coins = new Coins(this.scene);
    this.powerUps = new PowerUps(this.scene);
    this.world = new World(this.scene, this.obstacles, this.coins, this.powerUps);

    // Initialize UI and Controls
    this.ui = new UI({
      onStart: () => this.startGame(),
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartGame(),
      onPauseToggle: () => this.togglePause()
    });

    this.controls = new Controls((action) => this.handleAction(action));

    // Handle Resize
    window.addEventListener('resize', () => this.onResize());

    // Clock
    this.clock = new THREE.Clock();

    // Start Rendering Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x061910);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 350);
    this.camera.position.set(0, 4.0, -7.0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  initLights() {
    // Ambient Light (Jungle canopy bounce)
    const ambientLight = new THREE.AmbientLight(0x193b2a, 1.2);
    this.scene.add(ambientLight);

    // Hemisphere Light (Sky vs ground contrast)
    const hemiLight = new THREE.HemisphereLight(0x73a886, 0x1a2e22, 0.8);
    this.scene.add(hemiLight);

    // Directional Sunlight with Cascading Shadows
    this.sunLight = new THREE.DirectionalLight(0xfff0c2, 1.8);
    this.sunLight.position.set(16, 32, 15);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 70;
    this.sunLight.shadow.camera.left = -15;
    this.sunLight.shadow.camera.right = 15;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -10;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  handleAction(action) {
    if (this.state === 'START') {
      if (['jump', 'slide', 'left', 'right'].includes(action)) {
        this.startGame();
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (action === 'jump') {
        this.restartGame();
      }
      return;
    }

    if (action === 'pause') {
      this.togglePause();
      return;
    }

    if (this.state !== 'PLAYING') return;

    switch (action) {
      case 'left':
        this.player.moveLeft();
        soundFx.playLaneSwitch();
        break;
      case 'right':
        this.player.moveRight();
        soundFx.playLaneSwitch();
        break;
      case 'jump':
        this.player.jump();
        soundFx.playJump();
        break;
      case 'slide':
        this.player.slide();
        soundFx.playSlide();
        break;
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.forwardDistance = 0;
    this.currentSpeed = this.baseSpeed;
    this.coinsCollected = 0;
    this.score = 0;
    this.cameraShake = 0;

    this.player.reset();
    this.obstacles.reset();
    this.coins.reset();
    this.powerUps.reset();
    this.world.reset();

    this.ui.showPlaying();
    soundFx.startBGM();
  }

  resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.ui.hidePause();
      this.clock.getDelta(); // flush delta
      soundFx.startBGM();
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.ui.showPause(this.score, this.coinsCollected);
      soundFx.stopBGM();
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  restartGame() {
    this.startGame();
  }

  triggerScreenShake(intensity = 0.4) {
    this.cameraShake = Math.max(this.cameraShake, intensity);
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.player.die();
    this.triggerScreenShake(0.85);
    soundFx.playCrash();
    soundFx.stopBGM();

    setTimeout(() => {
      this.ui.showGameOver(this.score, this.coinsCollected, this.forwardDistance);
    }, 600);
  }

  // --- Main Update Loop ---
  update(delta) {
    // Keep delta sane on frame drops/tab switch
    const clampedDelta = Math.min(delta, 0.08);

    if (this.state === 'PLAYING') {
      // 1. Calculate progressive speed ramp
      // Base speed starts at 19, ramps up smoothly to 38+ as distance increases
      let targetSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.forwardDistance * 0.014);

      // Check active power-ups
      const powerStatus = this.powerUps.getActiveStatus();
      const hasSpeedBoost = powerStatus && powerStatus.type === 'SPEED_BOOST';
      const hasShield = powerStatus && powerStatus.type === 'SHIELD';
      const hasMagnet = powerStatus && powerStatus.type === 'MAGNET';

      if (hasSpeedBoost) {
        targetSpeed *= 1.55;
      }

      this.currentSpeed = targetSpeed;
      this.forwardDistance += this.currentSpeed * clampedDelta;

      // Update Player sync
      this.player.setShield(hasShield);
      this.player.setMagnet(hasMagnet);
      this.player.setSpeedBoost(hasSpeedBoost);
      this.player.update(clampedDelta, this.currentSpeed, this.forwardDistance);

      // 2. Update Difficulty level for spawning
      const difficultyLevel = 1.0 + Math.min(3.0, this.forwardDistance * 0.003);

      // 3. Update World, Obstacles, Coins, PowerUps
      this.world.update(clampedDelta, this.forwardDistance, difficultyLevel);
      this.obstacles.update(clampedDelta, this.forwardDistance);

      this.coins.update(clampedDelta, this.player.position, hasMagnet, () => {
        this.coinsCollected++;
        this.score += 25;
        soundFx.playCoin();
      });

      this.powerUps.update(clampedDelta, this.player.position, (type) => {
        soundFx.playPowerup();
        this.triggerScreenShake(0.25);
      });

      // 4. Collision Detection
      const playerBounds = this.player.getBounds();
      const hitObstacle = this.obstacles.checkCollision(playerBounds);

      if (hitObstacle) {
        if (hasSpeedBoost) {
          // Hyper-speed smashes through obstacle safely!
          this.obstacles.destroyObstacle(hitObstacle);
          this.triggerScreenShake(0.35);
          soundFx.playShieldBreak();
        } else if (hasShield) {
          // Shield absorbs the collision
          this.powerUps.consumeShield();
          this.obstacles.destroyObstacle(hitObstacle);
          this.triggerScreenShake(0.45);
          soundFx.playShieldBreak();
        } else {
          // Fatal collision
          this.gameOver();
        }
      }

      // 5. Update Score
      this.score += clampedDelta * (this.currentSpeed * 0.9);

      // 6. Update HUD
      const speedMultiplier = this.currentSpeed / this.baseSpeed;
      this.ui.updateHUD(this.score, this.coinsCollected, speedMultiplier, powerStatus);
    } else if (this.state === 'GAMEOVER') {
      this.player.update(clampedDelta, 0, this.forwardDistance);
      this.obstacles.update(clampedDelta, this.forwardDistance);
    }

    // 7. Update Follow Camera with Dynamic Look & Screen Shake
    this.updateCamera(clampedDelta);

    // 8. Sunlight follows player
    this.sunLight.position.z = this.forwardDistance + 15;
    this.sunLight.target.position.set(0, 0, this.forwardDistance + 10);
    this.sunLight.target.updateMatrixWorld();
  }

  updateCamera(delta) {
    // Desired camera target based on player
    const targetX = this.player.position.x * 0.45;
    const targetY = this.player.position.y * 0.25 + this.cameraOffset.y;
    const targetZ = this.player.position.z + this.cameraOffset.z;

    // Smooth lerp
    this.camera.position.x += (targetX - this.camera.position.x) * (delta * 10);
    this.camera.position.y += (targetY - this.camera.position.y) * (delta * 8);
    this.camera.position.z += (targetZ - this.camera.position.z) * (delta * 14);

    // Screen Shake effect
    if (this.cameraShake > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= Math.pow(0.04, delta);
    } else {
      this.cameraShake = 0;
    }

    // Look ahead down the track
    const lookTargetX = this.player.position.x * 0.7;
    const lookTargetY = this.player.position.y * 0.4 + 1.6;
    const lookTargetZ = this.player.position.z + this.cameraLookAhead;
    this.camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  }
}
