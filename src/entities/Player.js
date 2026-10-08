import * as THREE from 'three';

export class Player {
  constructor(scene) {
    this.scene = scene;

    // Movement & Lane configuration
    this.laneWidth = 2.4;
    this.currentLane = 0; // -1: Left, 0: Middle, 1: Right
    this.targetX = 0;
    this.position = new THREE.Vector3(0, 0, 0);

    // Running physics
    this.baseY = 0;
    this.vy = 0;
    this.gravity = -45;
    this.jumpForce = 14.5;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.85; // seconds

    // Animation & Cycle timers
    this.runCycle = 0;
    this.isDead = false;
    this.tiltAngle = 0;

    // Active power-up visuals
    this.hasShield = false;
    this.hasMagnet = false;
    this.hasSpeedBoost = false;

    // Dust particles
    this.dustParticles = [];

    // Create 3D explorer model
    this.mesh = new THREE.Group();
    this.buildExplorerModel();
    this.createShieldBubble();
    this.createMagnetVisual();
    this.createSpeedTrail();
    this.createShadow();
    this.createDustSystem();

    this.scene.add(this.mesh);
  }

  buildExplorerModel() {
    this.characterGroup = new THREE.Group();

    // Stylized Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xebaf80, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x98734c, roughness: 0.7 }); // Khaki/Explorer tan
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x4a3219, roughness: 0.8 }); // Leather vest
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x24362b, roughness: 0.7 }); // Jungle green cargo pants
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x1c150e, roughness: 0.9 }); // Dark boots
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x735334, roughness: 0.6 }); // Fedora brown
    const hatBandMat = new THREE.MeshStandardMaterial({ color: 0x22170d, roughness: 0.4 });
    const packMat = new THREE.MeshStandardMaterial({ color: 0x5a4128, roughness: 0.8 });

    // --- Torso & Vest ---
    this.torso = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.8, 0.45);
    const bodyMesh = new THREE.Mesh(bodyGeo, shirtMat);
    bodyMesh.castShadow = true;
    this.torso.add(bodyMesh);

    // Leather Vest Layer
    const vestGeo = new THREE.BoxGeometry(0.74, 0.75, 0.48);
    const vestMesh = new THREE.Mesh(vestGeo, vestMat);
    this.torso.add(vestMesh);

    // Belt & Gold Buckle
    const beltGeo = new THREE.BoxGeometry(0.72, 0.12, 0.47);
    const beltMesh = new THREE.Mesh(beltGeo, bootsMat);
    beltMesh.position.y = -0.35;
    this.torso.add(beltMesh);

    const buckleGeo = new THREE.BoxGeometry(0.18, 0.14, 0.49);
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xf5b82e, metalness: 0.8, roughness: 0.3 });
    const buckleMesh = new THREE.Mesh(buckleGeo, buckleMat);
    buckleMesh.position.y = -0.35;
    this.torso.add(buckleMesh);

    // Backpack
    const packGeo = new THREE.BoxGeometry(0.55, 0.6, 0.3);
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 0.05, -0.32);
    packMesh.castShadow = true;
    this.torso.add(packMesh);

    // Sleeping Roll on top of pack
    const rollGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.65, 8);
    rollGeo.rotateZ(Math.PI / 2);
    const rollMat = new THREE.MeshStandardMaterial({ color: 0x752b2b, roughness: 0.9 });
    const rollMesh = new THREE.Mesh(rollGeo, rollMat);
    rollMesh.position.set(0, 0.4, -0.32);
    this.torso.add(rollMesh);

    this.torso.position.y = 1.25;
    this.characterGroup.add(this.torso);

    // --- Head & Fedora ---
    this.headGroup = new THREE.Group();
    const headGeo = new THREE.BoxGeometry(0.42, 0.44, 0.42);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Explorer Fedora Hat Brim
    const brimGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 16);
    const brimMesh = new THREE.Mesh(brimGeo, hatMat);
    brimMesh.position.y = 0.22;
    this.headGroup.add(brimMesh);

    // Fedora Crown
    const crownGeo = new THREE.BoxGeometry(0.44, 0.28, 0.46);
    const crownMesh = new THREE.Mesh(crownGeo, hatMat);
    crownMesh.position.y = 0.38;
    this.headGroup.add(crownMesh);

    // Fedora Band
    const bandGeo = new THREE.BoxGeometry(0.46, 0.08, 0.48);
    const bandMesh = new THREE.Mesh(bandGeo, hatBandMat);
    bandMesh.position.y = 0.28;
    this.headGroup.add(bandMesh);

    this.headGroup.position.set(0, 1.85, 0);
    this.characterGroup.add(this.headGroup);

    // --- Arms (with shoulder pivots) ---
    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.22);
    armGeo.translate(0, -0.28, 0); // Pivot at shoulder

    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.46, 1.6, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.characterGroup.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.46, 1.6, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.characterGroup.add(this.rightArm);

    // --- Legs (with hip pivots) ---
    const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.28);
    legGeo.translate(0, -0.4, 0); // Pivot at hip

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, 0.85, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);

    // Left Boot
    const bootGeo = new THREE.BoxGeometry(0.26, 0.22, 0.36);
    const leftBootMesh = new THREE.Mesh(bootGeo, bootsMat);
    leftBootMesh.position.set(0, -0.72, 0.04);
    this.leftLeg.add(leftBootMesh);
    this.characterGroup.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, 0.85, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);

    // Right Boot
    const rightBootMesh = new THREE.Mesh(bootGeo, bootsMat);
    rightBootMesh.position.set(0, -0.72, 0.04);
    this.rightLeg.add(rightBootMesh);
    this.characterGroup.add(this.rightLeg);

    this.mesh.add(this.characterGroup);
  }

  createShieldBubble() {
    const geo = new THREE.SphereGeometry(1.4, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2ee6a8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x1bb562,
      emissiveIntensity: 0.5,
      wireframe: false,
    });
    this.shieldMesh = new THREE.Mesh(geo, mat);
    this.shieldMesh.position.set(0, 1.2, 0);
    this.shieldMesh.visible = false;
    this.mesh.add(this.shieldMesh);

    // Shield Orbit Rings
    const ringGeo = new THREE.TorusGeometry(1.45, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x70ffd0, transparent: true, opacity: 0.8 });
    this.shieldRing = new THREE.Mesh(ringGeo, ringMat);
    this.shieldRing.rotation.x = Math.PI / 3;
    this.shieldMesh.add(this.shieldRing);
  }

  createMagnetVisual() {
    this.magnetGroup = new THREE.Group();
    const uGeo = new THREE.TorusGeometry(0.35, 0.09, 8, 16, Math.PI);
    const uMat = new THREE.MeshStandardMaterial({ color: 0x3498db, metalness: 0.7, roughness: 0.3, emissive: 0x1f618d, emissiveIntensity: 0.6 });
    const uMesh = new THREE.Mesh(uGeo, uMat);
    uMesh.rotation.z = Math.PI;
    this.magnetGroup.add(uMesh);

    // Red/Blue poles
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.18, 8);
    const poleMatR = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
    const poleMatB = new THREE.MeshStandardMaterial({ color: 0x2980b9 });
    const poleR = new THREE.Mesh(poleGeo, poleMatR);
    poleR.position.set(-0.35, 0.09, 0);
    const poleB = new THREE.Mesh(poleGeo, poleMatB);
    poleB.position.set(0.35, 0.09, 0);
    this.magnetGroup.add(poleR);
    this.magnetGroup.add(poleB);

    this.magnetGroup.position.set(0, 2.7, 0);
    this.magnetGroup.visible = false;
    this.mesh.add(this.magnetGroup);
  }

  createSpeedTrail() {
    this.speedAuraGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const lineGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6);
      lineGeo.rotateX(Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.7 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set((Math.random() - 0.5) * 1.2, 0.5 + Math.random() * 1.2, -0.6 - Math.random() * 0.8);
      this.speedAuraGroup.add(line);
    }
    this.speedAuraGroup.visible = false;
    this.mesh.add(this.speedAuraGroup);
  }

  createShadow() {
    const shadowGeo = new THREE.CircleGeometry(0.7, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030805,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.position.y = 0.03;
    this.mesh.add(this.shadowMesh);
  }

  createDustSystem() {
    const pGeo = new THREE.SphereGeometry(0.08, 4, 4);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xc4a47c, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Mesh(pGeo, pMat.clone());
      p.visible = false;
      this.dustParticles.push({
        mesh: p,
        life: 0,
        maxLife: 0.35,
        velocity: new THREE.Vector3()
      });
      this.scene.add(p);
    }
  }

  spawnDust() {
    const p = this.dustParticles.find(item => !item.mesh.visible);
    if (p) {
      p.mesh.visible = true;
      p.life = 0;
      p.mesh.position.set(
        this.position.x + (Math.random() - 0.5) * 0.4,
        0.05,
        this.position.z - 0.3
      );
      p.velocity.set(
        (Math.random() - 0.5) * 1.5,
        0.5 + Math.random() * 1.0,
        -1.5 - Math.random() * 2.0
      );
      p.mesh.material.opacity = 0.6;
    }
  }

  // --- Controls & Actions ---
  moveLeft() {
    if (this.isDead) return;
    if (this.currentLane > -1) {
      this.currentLane--;
      this.targetX = this.currentLane * this.laneWidth;
      this.tiltAngle = 0.3; // Lean left
    }
  }

  moveRight() {
    if (this.isDead) return;
    if (this.currentLane < 1) {
      this.currentLane++;
      this.targetX = this.currentLane * this.laneWidth;
      this.tiltAngle = -0.3; // Lean right
    }
  }

  jump() {
    if (this.isDead || this.isJumping) return;
    this.isJumping = true;
    this.vy = this.jumpForce;
    if (this.isSliding) {
      this.endSlide();
    }
  }

  slide() {
    if (this.isDead || this.isSliding) return;
    if (this.isJumping) {
      // Fast fall down into slide
      this.vy = -20;
    }
    this.isSliding = true;
    this.slideTimer = this.slideDuration;
  }

  endSlide() {
    this.isSliding = false;
    this.slideTimer = 0;
    this.characterGroup.scale.set(1, 1, 1);
    this.characterGroup.rotation.x = 0;
  }

  setShield(active) {
    this.hasShield = active;
    this.shieldMesh.visible = active;
  }

  setMagnet(active) {
    this.hasMagnet = active;
    this.magnetGroup.visible = active;
  }

  setSpeedBoost(active) {
    this.hasSpeedBoost = active;
    this.speedAuraGroup.visible = active;
  }

  die() {
    this.isDead = true;
    this.setShield(false);
    this.setMagnet(false);
    this.setSpeedBoost(false);
  }

  reset() {
    this.currentLane = 0;
    this.targetX = 0;
    this.position.set(0, 0, 0);
    this.vy = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.runCycle = 0;
    this.isDead = false;
    this.tiltAngle = 0;

    this.characterGroup.scale.set(1, 1, 1);
    this.characterGroup.rotation.set(0, 0, 0);
    this.mesh.position.set(0, 0, 0);
    this.setShield(false);
    this.setMagnet(false);
    this.setSpeedBoost(false);

    this.dustParticles.forEach(p => {
      p.mesh.visible = false;
    });
  }

  // --- Main Update Loop ---
  update(delta, runSpeed, forwardDistance) {
    // 1. Forward progression
    this.position.z = forwardDistance;

    // 2. Smooth lane switching (lerp)
    this.position.x += (this.targetX - this.position.x) * (delta * 14);

    // Smooth tilt decay
    this.tiltAngle *= Math.pow(0.05, delta);
    this.characterGroup.rotation.z = this.tiltAngle;

    // 3. Jump physics
    if (this.isJumping) {
      this.position.y += this.vy * delta;
      this.vy += this.gravity * delta;

      if (this.position.y <= this.baseY) {
        this.position.y = this.baseY;
        this.vy = 0;
        this.isJumping = false;
        // Landing dust puff
        this.spawnDust();
        this.spawnDust();
      }
    } else {
      this.position.y = this.baseY;
    }

    // 4. Slide countdown & pose
    if (this.isSliding) {
      this.slideTimer -= delta;
      this.spawnDust();

      // Flatten and crouch
      this.characterGroup.scale.set(1, 0.5, 1.2);
      this.characterGroup.rotation.x = 0.45; // Lean forward/kneel slide
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = -1.2;
      this.leftLeg.rotation.x = 1.1;
      this.rightLeg.rotation.x = 1.1;

      if (this.slideTimer <= 0) {
        this.endSlide();
      }
    }

    // 5. Normal Run Animation Cycle (if not sliding or dead)
    if (!this.isSliding && !this.isDead) {
      this.characterGroup.scale.set(1, 1, 1);
      this.characterGroup.rotation.x = 0;

      if (this.isJumping) {
        // Leaping Pose
        this.leftArm.rotation.x = -0.8;
        this.rightArm.rotation.x = -0.8;
        this.leftLeg.rotation.x = -0.6;
        this.rightLeg.rotation.x = -0.3;
        this.torso.position.y = 1.25;
      } else {
        // Running cycle synced to speed
        this.runCycle += delta * runSpeed * 0.45;
        const swing = Math.sin(this.runCycle);
        const bob = Math.abs(Math.sin(this.runCycle * 2)) * 0.1;

        // Limb swinging
        this.leftLeg.rotation.x = swing * 0.85;
        this.rightLeg.rotation.x = -swing * 0.85;
        this.leftArm.rotation.x = -swing * 0.85;
        this.rightArm.rotation.x = swing * 0.85;

        // Subtle hip bobbing
        this.torso.position.y = 1.25 - bob;
        this.headGroup.position.y = 1.85 - bob * 1.2;
      }
    }

    // 6. Death stumble animation
    if (this.isDead) {
      this.characterGroup.rotation.x = THREE.MathUtils.lerp(this.characterGroup.rotation.x, -Math.PI / 2, delta * 8);
      this.characterGroup.position.y = THREE.MathUtils.lerp(this.characterGroup.position.y, 0.3, delta * 8);
    }

    // 7. Power-up active animations
    if (this.hasShield) {
      this.shieldMesh.rotation.y += delta * 2;
      this.shieldRing.rotation.z += delta * 3;
    }
    if (this.hasMagnet) {
      this.magnetGroup.rotation.y += delta * 4;
      this.magnetGroup.position.y = 2.7 + Math.sin(Date.now() * 0.008) * 0.15;
    }
    if (this.hasSpeedBoost) {
      this.speedAuraGroup.children.forEach(l => {
        l.position.z -= delta * 12;
        if (l.position.z < -2.5) {
          l.position.z = -0.5;
          l.position.x = (Math.random() - 0.5) * 1.4;
          l.position.y = 0.4 + Math.random() * 1.4;
        }
      });
    }

    // Shadow follow & scale with height
    const heightFactor = Math.max(0.2, 1 - this.position.y / 4.0);
    this.shadowMesh.scale.set(heightFactor, heightFactor, heightFactor);
    this.shadowMesh.position.y = 0.03 - this.position.y; // Keep on ground plane

    // 8. Update Dust Particles
    this.dustParticles.forEach(p => {
      if (p.mesh.visible) {
        p.life += delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
        p.mesh.material.opacity = 0.6 * (1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          p.mesh.visible = false;
        }
      }
    });

    // Sync Root Mesh Position
    this.mesh.position.copy(this.position);
  }

  // --- Accurate Collision Bounds ---
  getBounds() {
    const halfWidth = 0.4;
    const halfDepth = 0.45;
    let height = 1.9;
    let yBottom = this.position.y;

    if (this.isSliding) {
      height = 0.75; // Low crouch for sliding under high beams
    }

    return {
      minX: this.position.x - halfWidth,
      maxX: this.position.x + halfWidth,
      minY: yBottom,
      maxY: yBottom + height,
      minZ: this.position.z - halfDepth,
      maxZ: this.position.z + halfDepth,
      isSliding: this.isSliding,
      isJumping: this.isJumping,
      yPos: this.position.y
    };
  }
}
