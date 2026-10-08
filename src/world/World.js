import * as THREE from 'three';

export class World {
  constructor(scene, obstacles, coins, powerUps) {
    this.scene = scene;
    this.obstacles = obstacles;
    this.coins = coins;
    this.powerUps = powerUps;

    this.chunkLength = 36;
    this.numChunks = 8;
    this.chunks = [];
    this.nextChunkZ = -10; // Start slightly behind player so the starting view is rich
    this.chunkIndex = 0;

    // Atmospheric Fog (Deep emerald jungle mist)
    this.scene.fog = new THREE.FogExp2(0x061910, 0.018);

    // Shared Materials for optimized performance
    this.initMaterials();

    // Fireflies / Floating Jungle Spores
    this.initFireflies();

    // Build initial world chunks
    for (let i = 0; i < this.numChunks; i++) {
      this.spawnNextChunk();
    }
  }

  initMaterials() {
    this.pathMat = new THREE.MeshStandardMaterial({
      color: 0x3d4740,
      roughness: 0.85,
      metalness: 0.1
    });

    this.pathBorderMat = new THREE.MeshStandardMaterial({
      color: 0x242e27,
      roughness: 0.9
    });

    this.wallMat = new THREE.MeshStandardMaterial({
      color: 0x2d3a32,
      roughness: 0.95,
      flatShading: true
    });

    this.mossMat = new THREE.MeshStandardMaterial({
      color: 0x1f5c35,
      roughness: 0.9
    });

    this.foliageMat = new THREE.MeshStandardMaterial({
      color: 0x165b33,
      roughness: 0.7,
      flatShading: true
    });

    this.trunkMat = new THREE.MeshStandardMaterial({
      color: 0x2d1f11,
      roughness: 0.9
    });

    this.flameMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22
    });

    this.torchPedestalMat = new THREE.MeshStandardMaterial({
      color: 0x353d38,
      roughness: 0.9
    });

    this.bridgePlankMat = new THREE.MeshStandardMaterial({
      color: 0x3c2b18,
      roughness: 0.85
    });

    this.canyonMat = new THREE.MeshBasicMaterial({
      color: 0x030a06
    });
  }

  initFireflies() {
    const fireflyGeo = new THREE.BufferGeometry();
    const count = 120;
    const posArray = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 30; // X
      posArray[i + 1] = 0.5 + Math.random() * 5.0; // Y
      posArray[i + 2] = Math.random() * 150; // Z
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const fireflyMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x74ff97,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    this.scene.add(this.fireflies);
  }

  // --- Chunk Generation ---

  createChunk(startZ, variantIndex) {
    const group = new THREE.Group();
    group.position.z = startZ;

    const length = this.chunkLength;
    const variants = ['TEMPLE_CORRIDOR', 'JUNGLE_CLEARING', 'ANCIENT_BRIDGE'];
    const variant = variants[variantIndex % variants.length];

    // 1. Path Floor
    if (variant === 'ANCIENT_BRIDGE') {
      // Suspension bridge style planks with side ropes
      for (let z = 0; z < length; z += 1.8) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.25, 1.4), this.bridgePlankMat);
        plank.position.set(0, -0.1, z);
        plank.receiveShadow = true;
        group.add(plank);
      }
      // Canyon pit darkness below
      const canyon = new THREE.Mesh(new THREE.PlaneGeometry(16, length), this.canyonMat);
      canyon.rotation.x = -Math.PI / 2;
      canyon.position.set(0, -5.0, length / 2);
      group.add(canyon);

      // Bridge side railings / posts
      for (let z = 2; z < length; z += 6) {
        const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.5, 6);
        const postL = new THREE.Mesh(postGeo, this.trunkMat);
        postL.position.set(-3.7, 0.65, z);
        group.add(postL);

        const postR = new THREE.Mesh(postGeo, this.trunkMat);
        postR.position.set(3.7, 0.65, z);
        group.add(postR);
      }
    } else {
      // Solid ancient stone pathway
      const pathGeo = new THREE.BoxGeometry(7.6, 0.4, length);
      const pathMesh = new THREE.Mesh(pathGeo, this.pathMat);
      pathMesh.position.set(0, -0.2, length / 2);
      pathMesh.receiveShadow = true;
      group.add(pathMesh);

      // Stone curbs on left and right
      const curbGeo = new THREE.BoxGeometry(0.4, 0.35, length);
      const curbL = new THREE.Mesh(curbGeo, this.pathBorderMat);
      curbL.position.set(-3.7, 0.15, length / 2);
      group.add(curbL);

      const curbR = new THREE.Mesh(curbGeo, this.pathBorderMat);
      curbR.position.set(3.7, 0.15, length / 2);
      group.add(curbR);

      // Moss patches on path
      for (let z = 4; z < length; z += 8) {
        const mossGeo = new THREE.BoxGeometry(1.6, 0.02, 1.8);
        const moss = new THREE.Mesh(mossGeo, this.mossMat);
        moss.position.set((Math.random() - 0.5) * 4, 0.01, z);
        group.add(moss);
      }
    }

    // 2. Temple Walls or Jungle Perimeters
    if (variant === 'TEMPLE_CORRIDOR') {
      // Majestic ancient stone walls on both sides
      const wallGeo = new THREE.BoxGeometry(1.8, 5.0, length);
      const wallL = new THREE.Mesh(wallGeo, this.wallMat);
      wallL.position.set(-4.8, 2.3, length / 2);
      wallL.castShadow = true;
      group.add(wallL);

      const wallR = new THREE.Mesh(wallGeo, this.wallMat);
      wallR.position.set(4.8, 2.3, length / 2);
      wallR.castShadow = true;
      group.add(wallR);

      // Overhead stone temple archway across the corridor
      const archGeo = new THREE.BoxGeometry(11.4, 1.2, 1.5);
      const arch = new THREE.Mesh(archGeo, this.wallMat);
      arch.position.set(0, 4.6, length / 2);
      group.add(arch);
    }

    // 3. Torches along the way
    for (let z = 6; z < length; z += 16) {
      // Left Torch
      const torchL = this.createTorch();
      torchL.position.set(-3.5, 0, z);
      group.add(torchL);

      // Right Torch
      const torchR = this.createTorch();
      torchR.position.set(3.5, 0, z + 8);
      group.add(torchR);
    }

    // 4. Jungle Trees & Foliage (both flanks)
    const treeSpacing = variant === 'JUNGLE_CLEARING' ? 7 : 12;
    for (let z = 2; z < length; z += treeSpacing) {
      // Left tree
      const treeL = this.createJungleTree();
      treeL.position.set(-6.5 - Math.random() * 3, 0, z);
      group.add(treeL);

      // Right tree
      const treeR = this.createJungleTree();
      treeR.position.set(6.5 + Math.random() * 3, 0, z + 3);
      group.add(treeR);
    }

    return {
      group,
      startZ,
      endZ: startZ + length,
      variant
    };
  }

  createTorch() {
    const torch = new THREE.Group();
    // Stone pedestal
    const pedGeo = new THREE.BoxGeometry(0.35, 1.6, 0.35);
    const ped = new THREE.Mesh(pedGeo, this.torchPedestalMat);
    ped.position.y = 0.8;
    torch.add(ped);

    // Brazier bowl
    const bowlGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.3, 6);
    const bowl = new THREE.Mesh(bowlGeo, this.torchPedestalMat);
    bowl.position.y = 1.7;
    torch.add(bowl);

    // Flame mesh
    const flameGeo = new THREE.ConeGeometry(0.18, 0.45, 5);
    const flame = new THREE.Mesh(flameGeo, this.flameMat);
    flame.position.y = 1.95;
    torch.add(flame);

    // Warm Point Light (soft flicker)
    const light = new THREE.PointLight(0xff9922, 1.2, 12, 1.8);
    light.position.y = 2.1;
    torch.add(light);

    return torch;
  }

  createJungleTree() {
    const tree = new THREE.Group();
    // Tree Trunk
    const height = 7 + Math.random() * 4;
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, height, 6);
    const trunk = new THREE.Mesh(trunkGeo, this.trunkMat);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Layered Canopies (Tropical style)
    const numLayers = 3;
    for (let i = 0; i < numLayers; i++) {
      const radius = 2.4 - i * 0.5;
      const canopyGeo = new THREE.ConeGeometry(radius, 2.2, 6);
      const canopy = new THREE.Mesh(canopyGeo, this.foliageMat);
      canopy.position.y = height - 1.0 + i * 1.4;
      canopy.castShadow = true;
      tree.add(canopy);
    }

    return tree;
  }

  // --- Spawning Gameplay Items on Chunks ---

  populateChunk(startZ, length, difficultyLevel) {
    // Avoid spawning obstacles immediately in the very first 2 chunks (warmup zone)
    if (startZ < 30) {
      // Spawn simple coins in center
      this.coins.spawnLine(0, startZ + 8, 5, 2.2);
      return;
    }

    // Determine obstacle count based on difficulty (1 to 3 obstacle segments per chunk)
    const numObstacles = Math.min(3, 1 + Math.floor(difficultyLevel * 0.8));
    const stepZ = length / (numObstacles + 1);

    const obstacleTypes = ['FALLEN_TREE', 'LARGE_ROCK', 'STONE_WALL', 'LOW_BARRIER', 'HIGH_BARRIER', 'GAP'];

    for (let i = 1; i <= numObstacles; i++) {
      const z = startZ + i * stepZ;
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1

      if (type === 'FALLEN_TREE' || type === 'LOW_BARRIER') {
        // Can span 1 or 2 lanes
        this.obstacles.spawn(type, lane, z);
        // Spawn jumping coin arc over the barrier!
        this.coins.spawnJumpArc(lane, z - 4.5, 7, 1.5);
      } else if (type === 'GAP') {
        // Gap in path
        this.obstacles.spawn('GAP', 0, z); // Center gap
        this.coins.spawnJumpArc(0, z - 3.5, 6, 1.4);
      } else if (type === 'HIGH_BARRIER') {
        // Must slide under!
        this.obstacles.spawn('HIGH_BARRIER', lane, z);
        // Straight line of low coins underneath
        this.coins.spawnLine(lane, z - 4, 4, 2.0);
      } else {
        // Rock or Stone Wall
        this.obstacles.spawn(type, lane, z);

        // Put coins in an adjacent open lane
        const openLane = lane === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        if (Math.random() > 0.3) {
          this.coins.spawnLine(openLane, z - 4, 4, 2.2);
        }
      }
    }

    // Spawn Zig-Zag coins between obstacles occasionally
    if (Math.random() > 0.4) {
      this.coins.spawnZigZag(startZ + 5, 5, 2.6);
    }

    // Spawn Power-Up occasionally (~30% chance per chunk)
    if (Math.random() < 0.32) {
      const pTypes = ['MAGNET', 'SHIELD', 'SPEED_BOOST'];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      const pLane = Math.floor(Math.random() * 3) - 1;
      this.powerUps.spawn(pType, pLane, startZ + length * 0.75);
    }
  }

  spawnNextChunk(difficultyLevel = 1.0) {
    const chunk = this.createChunk(this.nextChunkZ, this.chunkIndex);
    this.scene.add(chunk.group);
    this.chunks.push(chunk);

    this.populateChunk(this.nextChunkZ, this.chunkLength, difficultyLevel);

    this.nextChunkZ += this.chunkLength;
    this.chunkIndex++;
  }

  update(delta, playerZ, difficultyLevel) {
    // 1. Check if oldest chunk is behind player and recycle
    if (this.chunks.length > 0) {
      const oldestChunk = this.chunks[0];
      if (oldestChunk.endZ < playerZ - 25) {
        // Remove from scene and dispose
        this.scene.remove(oldestChunk.group);
        this.chunks.shift();

        // Spawn new chunk ahead
        this.spawnNextChunk(difficultyLevel);
      }
    }

    // 2. Animate fireflies / jungle spores around player
    if (this.fireflies) {
      const pos = this.fireflies.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(Date.now() * 0.002 + i) * 0.01;
        // Keep fireflies drifting along with player
        if (pos[i + 2] < playerZ - 20) {
          pos[i + 2] = playerZ + 120 + Math.random() * 20;
        }
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }
  }

  reset() {
    this.chunks.forEach(chunk => {
      this.scene.remove(chunk.group);
    });
    this.chunks = [];
    this.nextChunkZ = -10;
    this.chunkIndex = 0;

    for (let i = 0; i < this.numChunks; i++) {
      this.spawnNextChunk(1.0);
    }
  }
}
