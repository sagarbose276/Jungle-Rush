import * as THREE from 'three';

export class PowerUps {
  constructor(scene) {
    this.scene = scene;
    this.laneWidth = 2.4;
    this.activePowerUps = [];
    this.pool = [];

    // State of active player power-up
    this.activeType = null; // 'MAGNET' | 'SHIELD' | 'SPEED_BOOST' | null
    this.timer = 0;
    this.maxDuration = 0;

    // Materials
    this.magnetMat = new THREE.MeshStandardMaterial({
      color: 0x2980b9,
      emissive: 0x3498db,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2
    });

    this.shieldMat = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      emissive: 0x2ecc71,
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.2
    });

    this.speedMat = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      emissive: 0xf1c40f,
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.2
    });
  }

  createMagnetMesh() {
    const group = new THREE.Group();
    const torusGeo = new THREE.TorusGeometry(0.45, 0.12, 10, 20, Math.PI);
    const torus = new THREE.Mesh(torusGeo, this.magnetMat);
    torus.rotation.z = Math.PI;
    group.add(torus);

    // Tips
    const tipGeo = new THREE.BoxGeometry(0.24, 0.25, 0.24);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, metalness: 0.9, roughness: 0.1 });
    const tipL = new THREE.Mesh(tipGeo, tipMat);
    tipL.position.set(-0.45, 0.12, 0);
    const tipR = new THREE.Mesh(tipGeo, tipMat);
    tipR.position.set(0.45, 0.12, 0);
    group.add(tipL);
    group.add(tipR);

    // Halo
    const haloGeo = new THREE.TorusGeometry(0.7, 0.03, 8, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x5dade2, transparent: true, opacity: 0.8 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    group.userData.type = 'MAGNET';
    return group;
  }

  createShieldMesh() {
    const group = new THREE.Group();
    // Mystic octahedron gem
    const gemGeo = new THREE.OctahedronGeometry(0.45, 0);
    const gem = new THREE.Mesh(gemGeo, this.shieldMat);
    group.add(gem);

    // Orbiting shield rings
    const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xa3e4d7, transparent: true, opacity: 0.8 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3;
    group.add(ring2);

    group.userData.type = 'SHIELD';
    return group;
  }

  createSpeedMesh() {
    const group = new THREE.Group();
    // Stylized Lightning Bolt / Winged Sun
    const boltShape = new THREE.Shape();
    boltShape.moveTo(0, 0.6);
    boltShape.lineTo(-0.35, 0.05);
    boltShape.lineTo(-0.05, 0.05);
    boltShape.lineTo(-0.25, -0.6);
    boltShape.lineTo(0.35, -0.05);
    boltShape.lineTo(0.05, -0.05);
    boltShape.closePath();

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const boltGeo = new THREE.ExtrudeGeometry(boltShape, extrudeSettings);
    boltGeo.center();
    const bolt = new THREE.Mesh(boltGeo, this.speedMat);
    group.add(bolt);

    // Golden Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.65, 0.03, 8, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    group.userData.type = 'SPEED_BOOST';
    return group;
  }

  spawn(type, laneIndex, zPos) {
    let mesh;
    const poolIdx = this.pool.findIndex(m => m.userData.type === type);
    if (poolIdx !== -1) {
      mesh = this.pool.splice(poolIdx, 1)[0];
    } else {
      switch (type) {
        case 'MAGNET':
          mesh = this.createMagnetMesh();
          break;
        case 'SHIELD':
          mesh = this.createShieldMesh();
          break;
        case 'SPEED_BOOST':
          mesh = this.createSpeedMesh();
          break;
        default:
          mesh = this.createMagnetMesh();
      }
      this.scene.add(mesh);
    }

    const xPos = laneIndex * this.laneWidth;
    mesh.position.set(xPos, 1.1, zPos);
    mesh.visible = true;

    this.activePowerUps.push({
      type,
      mesh,
      x: xPos,
      y: 1.1,
      z: zPos,
      collected: false
    });
  }

  activate(type) {
    this.activeType = type;
    if (type === 'MAGNET') {
      this.maxDuration = 10;
      this.timer = 10;
    } else if (type === 'SHIELD') {
      this.maxDuration = 15; // Shield lasts 15s or until hit
      this.timer = 15;
    } else if (type === 'SPEED_BOOST') {
      this.maxDuration = 6;
      this.timer = 6;
    }
  }

  consumeShield() {
    if (this.activeType === 'SHIELD') {
      this.activeType = null;
      this.timer = 0;
      return true;
    }
    return false;
  }

  update(delta, playerPos, onCollectPowerUp) {
    // 1. Update power-up pickup meshes in world
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const p = this.activePowerUps[i];

      p.mesh.rotation.y += delta * 3;
      p.mesh.position.y = p.y + Math.sin(Date.now() * 0.005) * 0.15;

      // Check collision with player
      const dx = playerPos.x - p.mesh.position.x;
      const dy = (playerPos.y + 0.8) - p.mesh.position.y;
      const dz = playerPos.z - p.mesh.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 1.8 && !p.collected) {
        p.collected = true;
        p.mesh.visible = false;
        this.pool.push(p.mesh);
        this.activePowerUps.splice(i, 1);
        this.activate(p.type);
        if (typeof onCollectPowerUp === 'function') {
          onCollectPowerUp(p.type);
        }
        continue;
      }

      // Recycle
      if (p.mesh.position.z < playerPos.z - 25) {
        p.mesh.visible = false;
        this.pool.push(p.mesh);
        this.activePowerUps.splice(i, 1);
      }
    }

    // 2. Active Power-up countdown timer
    if (this.activeType) {
      this.timer -= delta;
      if (this.timer <= 0) {
        this.activeType = null;
        this.timer = 0;
      }
    }
  }

  getActiveStatus() {
    if (!this.activeType) return null;
    return {
      type: this.activeType,
      timer: this.timer,
      ratio: Math.max(0, this.timer / this.maxDuration)
    };
  }

  reset() {
    this.activePowerUps.forEach(p => {
      p.mesh.visible = false;
      this.pool.push(p.mesh);
    });
    this.activePowerUps = [];
    this.activeType = null;
    this.timer = 0;
  }
}
