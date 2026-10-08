import * as THREE from 'three';

export class Coins {
  constructor(scene) {
    this.scene = scene;
    this.laneWidth = 2.4;
    this.activeCoins = [];
    this.pool = [];
    this.sparks = [];

    // Metallic Mayan/Ancient Gold Material
    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xaa7700,
      emissiveIntensity: 0.3
    });

    this.coinInnerMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.95,
      roughness: 0.3
    });

    this.coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    this.coinGeo.rotateZ(Math.PI / 2); // Face forward

    this.initSparkSystem();
  }

  initSparkSystem() {
    const geo = new THREE.SphereGeometry(0.06, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.sparks.push({
        mesh,
        life: 0,
        maxLife: 0.4,
        velocity: new THREE.Vector3()
      });
      this.scene.add(mesh);
    }
  }

  spawnSparks(pos) {
    for (let i = 0; i < 8; i++) {
      const s = this.sparks.find(item => !item.mesh.visible);
      if (s) {
        s.mesh.visible = true;
        s.life = 0;
        s.mesh.position.copy(pos);
        s.velocity.set(
          (Math.random() - 0.5) * 6,
          2 + Math.random() * 5,
          (Math.random() - 0.5) * 6
        );
      }
    }
  }

  createCoinMesh() {
    const group = new THREE.Group();
    const rim = new THREE.Mesh(this.coinGeo, this.coinMat);
    rim.castShadow = true;
    group.add(rim);

    // Decorative center emblem
    const centerGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 8);
    centerGeo.rotateZ(Math.PI / 2);
    const center = new THREE.Mesh(centerGeo, this.coinInnerMat);
    group.add(center);

    return group;
  }

  spawnSingle(x, y, z) {
    let mesh;
    if (this.pool.length > 0) {
      mesh = this.pool.pop();
    } else {
      mesh = this.createCoinMesh();
      this.scene.add(mesh);
    }

    mesh.position.set(x, y, z);
    mesh.visible = true;

    this.activeCoins.push({
      mesh,
      x,
      y,
      z,
      baseY: y,
      collected: false,
      rotOffset: Math.random() * Math.PI * 2
    });
  }

  // --- Pattern Generators ---

  // Straight line in a single lane
  spawnLine(laneIndex, startZ, count = 6, spacing = 2.5) {
    const x = laneIndex * this.laneWidth;
    for (let i = 0; i < count; i++) {
      this.spawnSingle(x, 0.85, startZ + i * spacing);
    }
  }

  // Zig-zag across lanes
  spawnZigZag(startZ, count = 6, spacing = 2.8) {
    const lanes = [-1, 0, 1, 0, -1, 0, 1];
    for (let i = 0; i < count; i++) {
      const lane = lanes[i % lanes.length];
      this.spawnSingle(lane * this.laneWidth, 0.85, startZ + i * spacing);
    }
  }

  // Parabolic Jumping Arc over an obstacle
  spawnJumpArc(laneIndex, startZ, count = 7, spacing = 1.6) {
    const x = laneIndex * this.laneWidth;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1); // 0 to 1
      // Parabola: 4 * t * (1 - t)
      const height = 0.85 + 2.0 * Math.sin(t * Math.PI);
      this.spawnSingle(x, height, startZ + i * spacing);
    }
  }

  // --- Update & Magnet Attraction & Player Collision ---

  update(delta, playerPos, hasMagnet, onCollect) {
    const magnetRadius = 14;
    const magnetSpeed = 32;

    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];

      // Spin & gentle float bobbing
      coin.mesh.rotation.y += delta * 4;
      if (!coin.collected) {
        coin.mesh.position.y = coin.baseY + Math.sin(Date.now() * 0.005 + coin.rotOffset) * 0.12;
      }

      // Magnet attraction
      if (hasMagnet && !coin.collected) {
        const dx = playerPos.x - coin.mesh.position.x;
        const dy = (playerPos.y + 0.8) - coin.mesh.position.y;
        const dz = playerPos.z - coin.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < magnetRadius) {
          // Accelerate toward player
          coin.mesh.position.x += (dx / dist) * magnetSpeed * delta;
          coin.mesh.position.y += (dy / dist) * magnetSpeed * delta;
          coin.mesh.position.z += (dz / dist) * magnetSpeed * delta;
        }
      }

      // Check Collection
      const dx = playerPos.x - coin.mesh.position.x;
      const dy = (playerPos.y + 0.8) - coin.mesh.position.y;
      const dz = playerPos.z - coin.mesh.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      // Player pickup radius ~1.2
      if (distSq < 1.44 && !coin.collected) {
        coin.collected = true;
        this.spawnSparks(coin.mesh.position);
        coin.mesh.visible = false;
        this.pool.push(coin.mesh);
        this.activeCoins.splice(i, 1);
        if (typeof onCollect === 'function') {
          onCollect();
        }
        continue;
      }

      // Recycle coins that fell far behind player
      if (coin.mesh.position.z < playerPos.z - 25) {
        coin.mesh.visible = false;
        this.pool.push(coin.mesh);
        this.activeCoins.splice(i, 1);
      }
    }

    // Update Spark Particles
    this.sparks.forEach(s => {
      if (s.mesh.visible) {
        s.life += delta;
        s.velocity.y -= 15 * delta;
        s.mesh.position.addScaledVector(s.velocity, delta);
        if (s.life >= s.maxLife) {
          s.mesh.visible = false;
        }
      }
    });
  }

  reset() {
    this.activeCoins.forEach(coin => {
      coin.mesh.visible = false;
      this.pool.push(coin.mesh);
    });
    this.activeCoins = [];
    this.sparks.forEach(s => {
      s.mesh.visible = false;
    });
  }
}
