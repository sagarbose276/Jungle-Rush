import * as THREE from 'three';

export class Obstacles {
  constructor(scene) {
    this.scene = scene;
    this.laneWidth = 2.4;
    this.activeObstacles = [];
    this.pool = [];

    // Shared Materials for ancient jungle ruins theme
    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x4a5a50,
      roughness: 0.9,
      metalness: 0.1
    });

    this.mossyWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d2c18,
      roughness: 0.85
    });

    this.mossHighlightMat = new THREE.MeshStandardMaterial({
      color: 0x224818,
      roughness: 0.95
    });

    this.rockMat = new THREE.MeshStandardMaterial({
      color: 0x38423b,
      roughness: 0.95,
      flatShading: true
    });

    this.runeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xff4422,
      emissive: 0xff3300,
      emissiveIntensity: 0.8,
      roughness: 0.3
    });

    this.debrisParticles = [];
    this.initDebrisSystem();
  }

  initDebrisSystem() {
    const geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const mat = new THREE.MeshStandardMaterial({ color: 0x5a5040, roughness: 0.9 });
    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.debrisParticles.push({
        mesh,
        life: 0,
        maxLife: 0.8,
        velocity: new THREE.Vector3(),
        rotSpeed: new THREE.Vector3()
      });
      this.scene.add(mesh);
    }
  }

  spawnDebris(pos) {
    for (let i = 0; i < 6; i++) {
      const p = this.debrisParticles.find(item => !item.mesh.visible);
      if (p) {
        p.mesh.visible = true;
        p.life = 0;
        p.mesh.position.set(
          pos.x + (Math.random() - 0.5) * 1.5,
          pos.y + 0.5 + Math.random() * 1.0,
          pos.z + (Math.random() - 0.5) * 1.0
        );
        p.velocity.set(
          (Math.random() - 0.5) * 10,
          4 + Math.random() * 8,
          5 + Math.random() * 10
        );
        p.rotSpeed.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      }
    }
  }

  // --- Obstacle Mesh Builders ---

  createFallenTreeMesh() {
    const group = new THREE.Group();
    // Trunk cylinder
    const logGeo = new THREE.CylinderGeometry(0.35, 0.4, 2.8, 10);
    logGeo.rotateZ(Math.PI / 2);
    const logMesh = new THREE.Mesh(logGeo, this.mossyWoodMat);
    logMesh.position.y = 0.35;
    logMesh.castShadow = true;
    group.add(logMesh);

    // Moss patch on top
    const mossGeo = new THREE.BoxGeometry(2.2, 0.12, 0.5);
    const mossMesh = new THREE.Mesh(mossGeo, this.mossHighlightMat);
    mossMesh.position.set(0, 0.65, 0);
    group.add(mossMesh);

    // Broken branch stub
    const stubGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.6, 6);
    stubGeo.rotateX(0.5);
    const stub = new THREE.Mesh(stubGeo, this.mossyWoodMat);
    stub.position.set(0.6, 0.6, 0.1);
    group.add(stub);

    group.userData.type = 'FALLEN_TREE';
    return group;
  }

  createLargeRockMesh() {
    const group = new THREE.Group();
    // Stylized jagged ancient boulder
    const rockGeo = new THREE.DodecahedronGeometry(1.0, 1);
    const rockMesh = new THREE.Mesh(rockGeo, this.rockMat);
    rockMesh.position.y = 0.9;
    rockMesh.scale.set(1.1, 1.2, 0.9);
    rockMesh.rotation.set(0.3, 0.5, 0.1);
    rockMesh.castShadow = true;
    group.add(rockMesh);

    // Small base pebbles
    const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), this.rockMat);
    p1.position.set(0.8, 0.25, 0.4);
    group.add(p1);

    group.userData.type = 'LARGE_ROCK';
    return group;
  }

  createStoneWallMesh() {
    const group = new THREE.Group();
    // Temple monolith
    const wallGeo = new THREE.BoxGeometry(2.3, 2.6, 0.7);
    const wallMesh = new THREE.Mesh(wallGeo, this.stoneMat);
    wallMesh.position.y = 1.3;
    wallMesh.castShadow = true;
    group.add(wallMesh);

    // Glowing ancient rune in center
    const runeGeo = new THREE.BoxGeometry(0.6, 0.8, 0.75);
    const runeMesh = new THREE.Mesh(runeGeo, this.runeGlowMat);
    runeMesh.position.y = 1.4;
    group.add(runeMesh);

    group.userData.type = 'STONE_WALL';
    return group;
  }

  createLowBarrierMesh() {
    const group = new THREE.Group();
    // Low ancient stone hurdle / spike barrier
    const baseGeo = new THREE.BoxGeometry(2.3, 0.25, 0.5);
    const baseMesh = new THREE.Mesh(baseGeo, this.stoneMat);
    baseMesh.position.y = 0.12;
    group.add(baseMesh);

    // 4 Spikes
    for (let i = -0.75; i <= 0.75; i += 0.5) {
      const spikeGeo = new THREE.ConeGeometry(0.18, 0.6, 5);
      const spike = new THREE.Mesh(spikeGeo, this.stoneMat);
      spike.position.set(i, 0.5, 0);
      spike.castShadow = true;
      group.add(spike);
    }

    // Glowing hazard gem
    const gemGeo = new THREE.OctahedronGeometry(0.15, 0);
    const gem = new THREE.Mesh(gemGeo, this.runeGlowMat);
    gem.position.set(0, 0.65, 0);
    group.add(gem);

    group.userData.type = 'LOW_BARRIER';
    return group;
  }

  createHighBarrierMesh() {
    const group = new THREE.Group();
    // Twin ancient stone pillars
    const pillarGeo = new THREE.BoxGeometry(0.45, 2.8, 0.55);
    const pLeft = new THREE.Mesh(pillarGeo, this.stoneMat);
    pLeft.position.set(-1.1, 1.4, 0);
    pLeft.castShadow = true;
    group.add(pLeft);

    const pRight = new THREE.Mesh(pillarGeo, this.stoneMat);
    pRight.position.set(1.1, 1.4, 0);
    pRight.castShadow = true;
    group.add(pRight);

    // High horizontal lintel beam (clearance underneath is y: 0 to 1.1)
    const lintelGeo = new THREE.BoxGeometry(2.65, 0.9, 0.7);
    const lintel = new THREE.Mesh(lintelGeo, this.stoneMat);
    lintel.position.set(0, 2.1, 0); // Bottom is at y = 1.65, clears sliding player!
    lintel.castShadow = true;
    group.add(lintel);

    // Hanging vine / talisman banner
    const vineGeo = new THREE.BoxGeometry(0.15, 0.4, 0.1);
    const vine = new THREE.Mesh(vineGeo, this.mossHighlightMat);
    vine.position.set(0.3, 1.5, 0);
    group.add(vine);

    group.userData.type = 'HIGH_BARRIER';
    return group;
  }

  createGapMesh() {
    const group = new THREE.Group();
    // Visual indicators for broken floor bridge gap
    // Left and right side jagged edge planks
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x2e2010, roughness: 0.9 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.4), plankMat);
    p1.position.set(0, 0.05, -2.1);
    group.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.4), plankMat);
    p2.position.set(0, 0.05, 2.1);
    group.add(p2);

    // Pit abyss darkness block
    const pitGeo = new THREE.BoxGeometry(2.5, 4.0, 4.0);
    const pitMat = new THREE.MeshBasicMaterial({ color: 0x020805 });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(0, -2.05, 0);
    group.add(pit);

    group.userData.type = 'GAP';
    return group;
  }

  // --- Spawning System ---

  spawn(type, laneIndex, zPos) {
    let obstacleMesh;
    // Check pool
    const poolIdx = this.pool.findIndex(m => m.userData.type === type);
    if (poolIdx !== -1) {
      obstacleMesh = this.pool.splice(poolIdx, 1)[0];
    } else {
      switch (type) {
        case 'FALLEN_TREE':
          obstacleMesh = this.createFallenTreeMesh();
          break;
        case 'LARGE_ROCK':
          obstacleMesh = this.createLargeRockMesh();
          break;
        case 'STONE_WALL':
          obstacleMesh = this.createStoneWallMesh();
          break;
        case 'LOW_BARRIER':
          obstacleMesh = this.createLowBarrierMesh();
          break;
        case 'HIGH_BARRIER':
          obstacleMesh = this.createHighBarrierMesh();
          break;
        case 'GAP':
          obstacleMesh = this.createGapMesh();
          break;
        default:
          obstacleMesh = this.createLargeRockMesh();
      }
      this.scene.add(obstacleMesh);
    }

    const xPos = laneIndex * this.laneWidth;
    obstacleMesh.position.set(xPos, 0, zPos);
    obstacleMesh.visible = true;

    // Hitbox specification
    let hitbox = {
      type,
      x: xPos,
      z: zPos,
      lane: laneIndex,
      width: 2.2,
      depth: 0.8,
      minY: 0,
      maxY: 2.0,
      mesh: obstacleMesh
    };

    if (type === 'FALLEN_TREE') {
      hitbox.minY = 0;
      hitbox.maxY = 0.75;
      hitbox.depth = 0.7;
    } else if (type === 'LOW_BARRIER') {
      hitbox.minY = 0;
      hitbox.maxY = 0.75;
      hitbox.depth = 0.6;
    } else if (type === 'HIGH_BARRIER') {
      // Must slide! Clearance underneath is y = 0 to 1.1.
      hitbox.minY = 1.1; // Only collides if player's head reaches above 1.1
      hitbox.maxY = 2.8;
      hitbox.depth = 0.7;
    } else if (type === 'LARGE_ROCK') {
      hitbox.minY = 0;
      hitbox.maxY = 1.8;
      hitbox.width = 1.9;
      hitbox.depth = 1.4;
    } else if (type === 'STONE_WALL') {
      hitbox.minY = 0;
      hitbox.maxY = 2.6;
      hitbox.width = 2.2;
      hitbox.depth = 0.8;
    } else if (type === 'GAP') {
      // Must jump over!
      hitbox.minY = -1.0;
      hitbox.maxY = 0.35; // If player is at ground level, falls!
      hitbox.depth = 3.8;
    }

    this.activeObstacles.push(hitbox);
  }

  // --- Collision Detection with Player ---
  checkCollision(playerBounds) {
    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];

      const xOverlap = Math.abs(obs.x - (playerBounds.minX + playerBounds.maxX) / 2) < (obs.width / 2 + 0.35);
      const zOverlap = Math.abs(obs.z - (playerBounds.minZ + playerBounds.maxZ) / 2) < (obs.depth / 2 + 0.35);

      if (xOverlap && zOverlap) {
        if (obs.type === 'HIGH_BARRIER') {
          // If player is sliding, their maxY is ~0.75 which is < obs.minY (1.1) -> SAFE!
          if (playerBounds.isSliding && playerBounds.maxY < obs.minY) {
            continue; // Safely slided underneath!
          }
          return obs; // Bumped head into lintel
        }

        if (obs.type === 'FALLEN_TREE' || obs.type === 'LOW_BARRIER') {
          // If player is jumping with feet above the hurdle -> SAFE!
          if (playerBounds.yPos > obs.maxY) {
            continue; // Cleared jump!
          }
          return obs; // Hit barrier
        }

        if (obs.type === 'GAP') {
          // If player is airborne (jumping) -> SAFE!
          if (playerBounds.yPos > 0.45) {
            continue; // Jumped over gap!
          }
          return obs; // Fell in gap
        }

        // LARGE_ROCK and STONE_WALL always collide if in the lane
        return obs;
      }
    }
    return null;
  }

  destroyObstacle(obs) {
    this.spawnDebris(obs.mesh.position);
    obs.mesh.visible = false;
    const idx = this.activeObstacles.indexOf(obs);
    if (idx !== -1) {
      this.activeObstacles.splice(idx, 1);
      this.pool.push(obs.mesh);
    }
  }

  update(delta, playerZ) {
    // 1. Recycle obstacles that fell far behind player
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      if (obs.z < playerZ - 25) {
        obs.mesh.visible = false;
        this.pool.push(obs.mesh);
        this.activeObstacles.splice(i, 1);
      }
    }

    // 2. Update debris physics
    this.debrisParticles.forEach(p => {
      if (p.mesh.visible) {
        p.life += delta;
        p.velocity.y -= 25 * delta; // Gravity
        p.mesh.position.addScaledVector(p.velocity, delta);
        p.mesh.rotation.x += p.rotSpeed.x * delta;
        p.mesh.rotation.y += p.rotSpeed.y * delta;
        if (p.life >= p.maxLife || p.mesh.position.y < -3) {
          p.mesh.visible = false;
        }
      }
    });
  }

  reset() {
    this.activeObstacles.forEach(obs => {
      obs.mesh.visible = false;
      this.pool.push(obs.mesh);
    });
    this.activeObstacles = [];
    this.debrisParticles.forEach(p => {
      p.mesh.visible = false;
    });
  }
}
