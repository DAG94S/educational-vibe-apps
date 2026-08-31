import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEnigmaStore } from '../store/enigmaStore';

export class Enigma3DScene {
  constructor(container) {
    this.container = container;
    this.animationFrameId = null;
    this.disposables = [];

    // UI Interactive state
    this.selectedPlugSocket = null;
    this.wires = []; 
    this.activeLamp = null;
    this.activeLampTimer = null;
    this.glowingPaths = []; 

    // Core Enigma Coordinates Map
    this.keyPositionsMap = {}; 
    this.lampPositionsMap = {}; 
    this.plugboardSocketsMap = {}; 
    
    // 1. Setup Three.js Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f7fa); // Bunker light premium theme
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; 
    this.controls.minDistance = 5;
    this.controls.maxDistance = 40;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 20, 10);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x00ffaa, 1, 30, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 12, 0);
    spotLight.target.position.set(0, 0, 0);
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);

    // 2. Build Enigma 3D Model
    this.buildEnigmaCabinet();

    // 3. Event Listeners
    this.resizeHandler = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clickHandler = this.onClick.bind(this);
    this.renderer.domElement.addEventListener('click', this.clickHandler);

    // 4. Connect to Zustand Store
    const initialState = useEnigmaStore.getState();
    this.prevPositions = [...initialState.positions];
    this.updateRotorMeshRotationsFromPositions(this.prevPositions);

    this.unsubscribeStore = useEnigmaStore.subscribe((state) => {
      // Rotate rotors if state changed externally (e.g. from sliders or console)
      const posChanged = state.positions.some((p, idx) => p !== this.prevPositions[idx]);
      if (posChanged) {
        this.prevPositions = [...state.positions];
        this.updateRotorMeshRotationsFromPositions(state.positions);
      }
      // Sync wires when plugboard resets
      this.syncPlugboardWires(state.plugboardPairs);
    });

    // 5. Start Render Loop
    this.animate();
  }

  // Tracking disposables
  trackDisposable(obj) {
    if (obj) this.disposables.push(obj);
    return obj;
  }

  // ----------------------------------------------------
  // Procedural 3D Modeling
  // ----------------------------------------------------
  buildEnigmaCabinet() {
    // 1. Casing wood box
    const cabinetGeom = this.trackDisposable(new THREE.BoxGeometry(11, 4, 15));
    const cabinetMat = this.trackDisposable(new THREE.MeshStandardMaterial({
      color: 0x3d2b1f, // Rich dark mahogany wood
      roughness: 0.8,
      metalness: 0.1
    }));
    const cabinet = new THREE.Mesh(cabinetGeom, cabinetMat);
    cabinet.position.y = -2;
    cabinet.receiveShadow = true;
    this.scene.add(cabinet);

    // Metal faceplate
    const plateGeom = this.trackDisposable(new THREE.BoxGeometry(10.6, 0.2, 14.6));
    const plateMat = this.trackDisposable(new THREE.MeshStandardMaterial({
      color: 0x22252a, // Dark gunmetal grey
      roughness: 0.4,
      metalness: 0.8
    }));
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.y = 0;
    this.scene.add(plate);

    // Components
    this.buildKeyboard();
    this.buildLampboard();
    this.buildRotors();
    this.buildPlugboardPanel();
  }

  buildKeyboard() {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
      ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L']
    ];

    const keyGeom = this.trackDisposable(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16));
    const keyMat = this.trackDisposable(new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.5,
      metalness: 0.7
    }));

    const keyCapGeom = this.trackDisposable(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16));
    const keyCapMat = this.trackDisposable(new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.2
    }));

    const startZ = 2.0;
    const spacingX = 0.9;
    const spacingZ = 1.1;

    rows.forEach((row, rIdx) => {
      const z = startZ + rIdx * spacingZ;
      const rowWidth = (row.length - 1) * spacingX;
      const startX = -rowWidth / 2;

      row.forEach((char, cIdx) => {
        const x = startX + cIdx * spacingX;
        const y = 0.2;

        const keyGroup = new THREE.Group();
        keyGroup.position.set(x, y, z);

        const stem = new THREE.Mesh(keyGeom, keyMat);
        stem.castShadow = true;
        keyGroup.add(stem);

        const cap = new THREE.Mesh(keyCapGeom, keyCapMat);
        cap.position.y = 0.1;
        keyGroup.add(cap);

        keyGroup.userData = {
          type: 'key',
          char: char
        };

        this.scene.add(keyGroup);
        this.keyPositionsMap[char] = new THREE.Vector3(x, y + 0.1, z);
      });
    });
  }

  buildLampboard() {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
      ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L']
    ];

    const startZ = -1.8;
    const spacingX = 0.9;
    const spacingZ = 1.1;

    this.lamps = {}; 

    rows.forEach((row, rIdx) => {
      const z = startZ + rIdx * spacingZ;
      const rowWidth = (row.length - 1) * spacingX;
      const startX = -rowWidth / 2;

      row.forEach((char, cIdx) => {
        const x = startX + cIdx * spacingX;
        const y = 0.15;

        // Rim casing
        const rimGeom = this.trackDisposable(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 16));
        const rimMat = this.trackDisposable(new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.3 }));
        const rim = new THREE.Mesh(rimGeom, rimMat);
        rim.position.set(x, y, z);
        this.scene.add(rim);

        // Glass bulb dome
        const bulbGeom = this.trackDisposable(new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2));
        const bulbMat = this.trackDisposable(new THREE.MeshStandardMaterial({
          color: 0x444433,
          emissive: 0x000000,
          roughness: 0.1,
          metalness: 0.1
        }));
        const bulb = new THREE.Mesh(bulbGeom, bulbMat);
        bulb.position.set(x, y + 0.05, z);
        bulb.userData = { type: 'lamp', char: char };
        
        this.scene.add(bulb);
        this.lamps[char] = bulb;
        this.lampPositionsMap[char] = new THREE.Vector3(x, y + 0.1, z);
      });
    });
  }

  buildRotors() {
    this.rotorMeshes = [];
    const rotorWidth = 0.8;
    const rotorRadius = 1.1;
    const startX = -1.3;
    const spacingX = 1.3;
    const y = 0.4;
    const z = -4.5;

    // Shaft holder
    const shaftGeom = this.trackDisposable(new THREE.CylinderGeometry(0.1, 0.1, 4.5, 16));
    const shaftMat = this.trackDisposable(new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.9 }));
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0, y, z);
    this.scene.add(shaft);

    // Reflector
    const reflectorGeom = this.trackDisposable(new THREE.CylinderGeometry(1.2, 1.2, 0.6, 24));
    const reflectorMat = this.trackDisposable(new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.9, roughness: 0.4 }));
    const reflector = new THREE.Mesh(reflectorGeom, reflectorMat);
    reflector.rotation.z = Math.PI / 2;
    reflector.position.set(startX - 1.1, y, z);
    reflector.userData = { type: 'reflector' };
    this.scene.add(reflector);

    // 3 Rotors (Left, Middle, Right)
    for (let i = 0; i < 3; i++) {
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(startX + i * spacingX, y, z);

      const cylGeom = this.trackDisposable(new THREE.CylinderGeometry(rotorRadius, rotorRadius, rotorWidth, 24));
      const cylMat = this.trackDisposable(new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.2
      }));
      const cyl = new THREE.Mesh(cylGeom, cylMat);
      cyl.rotation.z = Math.PI / 2;
      rotorGroup.add(cyl);

      const cogGeom = this.trackDisposable(new THREE.TorusGeometry(rotorRadius + 0.05, 0.05, 8, 24));
      const cogMat = this.trackDisposable(new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6 }));
      const cog = new THREE.Mesh(cogGeom, cogMat);
      cog.rotation.y = Math.PI / 2;
      rotorGroup.add(cog);

      const notchGeom = this.trackDisposable(new THREE.BoxGeometry(0.1, 0.1, 0.2));
      const notchMat = this.trackDisposable(new THREE.MeshStandardMaterial({ color: 0xffffff }));
      
      for (let charIdx = 0; charIdx < 26; charIdx++) {
        const angle = (charIdx / 26) * Math.PI * 2;
        const letterNotch = new THREE.Mesh(notchGeom, notchMat);
        
        letterNotch.position.set(
          0.38, 
          Math.sin(angle) * (rotorRadius + 0.02), 
          Math.cos(angle) * (rotorRadius + 0.02)
        );
        letterNotch.rotation.x = -angle;
        rotorGroup.add(letterNotch);
      }

      rotorGroup.userData = {
        type: 'rotor',
        index: i // 0: Left, 1: Middle, 2: Right
      };

      this.scene.add(rotorGroup);
      this.rotorMeshes.push(rotorGroup);
    }
  }

  buildPlugboardPanel() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const startX = -4.5;
    const spacingX = 0.76;
    const y1 = -0.5;
    const y2 = -1.2;
    const z = 7.1;

    const plGeom = this.trackDisposable(new THREE.BoxGeometry(10.2, 1.8, 0.1));
    const plMat = this.trackDisposable(new THREE.MeshStandardMaterial({ color: 0x111215, metalness: 0.4, roughness: 0.6 }));
    const plPanel = new THREE.Mesh(plGeom, plMat);
    plPanel.position.set(0, -0.85, z - 0.05);
    this.scene.add(plPanel);

    for (let i = 0; i < 26; i++) {
      const char = alphabet[i];
      const col = i % 13;
      const row = Math.floor(i / 13);
      
      const x = startX + col * spacingX;
      const y = (row === 0) ? y1 : y2;

      const sockGeom = this.trackDisposable(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12));
      const sockMat = this.trackDisposable(new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 }));
      const socket = new THREE.Mesh(sockGeom, sockMat);
      socket.rotation.x = Math.PI / 2;
      socket.position.set(x, y, z);
      socket.userData = {
        type: 'socket',
        char: char
      };

      this.scene.add(socket);
      this.plugboardSocketsMap[char] = socket;
    }
  }

  // ----------------------------------------------------
  // Interactive Raycasting & Click Handler
  // ----------------------------------------------------
  onClick(event) {
    // Prevent raycasting on UI overlay clicks
    if (event.target.closest('.interactive-ui')) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData.type) {
        obj = obj.parent;
      }

      if (obj && obj.userData.type) {
        this.handle3DClick(obj.userData, obj);
      }
    }
  }

  handle3DClick(data, mesh) {
    const store = useEnigmaStore.getState();

    if (data.type === 'key') {
      // Physical animation press
      const originalY = mesh.position.y;
      mesh.position.y -= 0.12;
      setTimeout(() => { mesh.position.y = originalY; }, 120);

      // Mutate state in store
      const result = store.pressKey(data.char);
      
      // Local Visual animations
      this.updateRotorMeshRotationsFromPositions(result.positions);
      this.lightLamp(result.char);
      this.animatePathway(result.path);
      
    } else if (data.type === 'rotor') {
      const idx = data.index;
      const currentPos = store.positions[idx];
      const newPos = [...store.positions];
      newPos[idx] = (currentPos + 1) % 26;

      // Update positions in store
      store.setPositions(newPos);
      this.updateRotorMeshRotationsFromPositions(newPos);

      // Trigger quiz
      store.triggerQuiz('rotor');

    } else if (data.type === 'socket') {
      this.handleSocketWiring(data.char, mesh);

    } else if (data.type === 'reflector') {
      store.triggerQuiz('reflector');
    }
  }

  // ----------------------------------------------------
  // Dynamic 3D Wiring (Plugboard)
  // ----------------------------------------------------
  handleSocketWiring(char, socketMesh) {
    const store = useEnigmaStore.getState();

    if (this.selectedPlugSocket === null) {
      this.selectedPlugSocket = { char, mesh: socketMesh };
      socketMesh.material.color.setHex(0x00ffcc); // highlight green
      store.addLog('system', `Seleccionado clavijero: <strong>${char}</strong>. Elegí otra letra para conectar.`);
    } else {
      const char1 = this.selectedPlugSocket.char;
      const char2 = char;
      const socketMesh1 = this.selectedPlugSocket.mesh;

      socketMesh1.material.color.setHex(0x050505);

      if (char1 === char2) {
        this.selectedPlugSocket = null;
        store.addLog('system', 'Selección cancelada.');
        return;
      }

      // Remove existing 3D wires and plugs
      this.removeWireMesh(char1);
      this.removeWireMesh(char2);

      // Update logic store
      store.addPlug(char1, char2);
      
      // Draw wire
      this.drawWire(char1, char2);
      
      this.selectedPlugSocket = null;
      store.addLog('system', `Conectado clavijero: <strong>${char1} &harr; ${char2}</strong>`);
      
      // Trigger plugboard pedagogy quiz
      store.triggerQuiz('plugboard');
    }
  }

  drawWire(char1, char2) {
    const sock1 = this.plugboardSocketsMap[char1];
    const sock2 = this.plugboardSocketsMap[char2];

    const pos1 = sock1.position.clone();
    const pos2 = sock2.position.clone();

    // Droup Bezier curve for wires
    const midPoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    midPoint.y -= 1.2;
    midPoint.z += 0.8;

    const curve = new THREE.CatmullRomCurve3([pos1, midPoint, pos2]);
    const points = curve.getPoints(16);

    const wireGeom = this.trackDisposable(new THREE.BufferGeometry().setFromPoints(points));
    const wireMat = this.trackDisposable(new THREE.LineBasicMaterial({
      color: 0xaa3322,
      linewidth: 3
    }));

    const wireLine = new THREE.Line(wireGeom, wireMat);
    wireLine.userData = { chars: [char1, char2] };
    this.scene.add(wireLine);
    this.wires.push(wireLine);
  }

  removeWireMesh(char) {
    // Logic removal from store
    useEnigmaStore.getState().removePlug(char);
    
    // 3D Visual removal
    for (let i = this.wires.length - 1; i >= 0; i--) {
      const wire = this.wires[i];
      if (wire.userData.chars.includes(char)) {
        this.scene.remove(wire);
        wire.geometry.dispose();
        wire.material.dispose();
        this.wires.splice(i, 1);
      }
    }
  }

  syncPlugboardWires(pairs) {
    // Simple wire sync on reset
    if (pairs.length === 0 && this.wires.length > 0) {
      this.wires.forEach(wire => {
        this.scene.remove(wire);
        wire.geometry.dispose();
        wire.material.dispose();
      });
      this.wires = [];
      // Ensure all sockets reset color
      for (const char in this.plugboardSocketsMap) {
        this.plugboardSocketsMap[char].material.color.setHex(0x050505);
      }
      this.selectedPlugSocket = null;
    }
  }

  // ----------------------------------------------------
  // Visual Animations (Pathway Splines & Lamps)
  // ----------------------------------------------------
  lightLamp(char) {
    if (this.activeLamp) {
      this.activeLamp.material.emissive.setHex(0x000000);
      this.activeLamp.material.color.setHex(0x444433);
    }
    clearTimeout(this.activeLampTimer);

    const bulb = this.lamps[char];
    if (bulb) {
      bulb.material.emissive.setHex(0xffaa00); // Glow Amber
      bulb.material.color.setHex(0xffbb22);
      this.activeLamp = bulb;
      
      this.activeLampTimer = setTimeout(() => {
        bulb.material.emissive.setHex(0x000000);
        bulb.material.color.setHex(0x444433);
        this.activeLamp = null;
      }, 700);
    }
  }

  animatePathway(pathData) {
    this.glowingPaths.forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    this.glowingPaths = [];

    if (!pathData || pathData.length === 0) return;

    const coords = [];

    pathData.forEach(node => {
      const charStr = String.fromCharCode(65 + node.val);
      if (node.stage === 'keyboard') {
        coords.push(this.keyPositionsMap[charStr]);
      } else if (node.stage === 'plugboard_in' || node.stage === 'plugboard_out') {
        coords.push(this.plugboardSocketsMap[charStr].position);
      } else if (node.stage === 'rotor_right_in' || node.stage === 'rotor_right_out') {
        coords.push(this.rotorMeshes[2].position);
      } else if (node.stage === 'rotor_mid_in' || node.stage === 'rotor_mid_out') {
        coords.push(this.rotorMeshes[1].position);
      } else if (node.stage === 'rotor_left_in' || node.stage === 'rotor_left_out') {
        coords.push(this.rotorMeshes[0].position);
      } else if (node.stage === 'reflector') {
        coords.push(new THREE.Vector3(-2.4, 0.4, -4.5));
      } else if (node.stage === 'lampboard') {
        coords.push(this.lampPositionsMap[charStr]);
      }
    });

    const curve = new THREE.CatmullRomCurve3(coords);
    const points = curve.getPoints(50);

    const pathGeom = this.trackDisposable(new THREE.BufferGeometry().setFromPoints(points));
    const pathMat = this.trackDisposable(new THREE.LineBasicMaterial({
      color: 0x00ffbb,
      transparent: true,
      opacity: 0.9
    }));

    const flowLine = new THREE.Line(pathGeom, pathMat);
    this.scene.add(flowLine);
    this.glowingPaths.push(flowLine);

    let alpha = 0.9;
    const fade = () => {
      alpha -= 0.04;
      if (alpha <= 0) {
        this.scene.remove(flowLine);
        pathGeom.dispose();
        pathMat.dispose();
      } else {
        pathMat.opacity = alpha;
        requestAnimationFrame(fade);
      }
    };
    setTimeout(fade, 300);
  }

  updateRotorMeshRotationsFromPositions(posArray) {
    if (!this.rotorMeshes || this.rotorMeshes.length < 3) return;
    for (let i = 0; i < 3; i++) {
      const pos = posArray[i];
      const targetAngle = (pos / 26) * Math.PI * 2;
      this.rotorMeshes[i].rotation.x = targetAngle;
    }
  }

  // ----------------------------------------------------
  // Render Loop & Resize
  // ----------------------------------------------------
  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ----------------------------------------------------
  // WebGL Resource Cleanup
  // ----------------------------------------------------
  destroy() {
    console.log('--- ENIGMA 3D SCENE: DISPOSING GPU RESOURCES ---');

    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.resizeHandler);
    this.renderer.domElement.removeEventListener('click', this.clickHandler);
    
    if (this.activeLampTimer) {
      clearTimeout(this.activeLampTimer);
    }

    // Dispose geometries & materials
    this.disposables.forEach(resource => {
      if (resource.dispose) resource.dispose();
    });
    this.disposables = [];

    // Dispose wire meshes
    this.wires.forEach(wire => {
      wire.geometry.dispose();
      wire.material.dispose();
      this.scene.remove(wire);
    });
    this.wires = [];

    // Dispose path lines
    this.glowingPaths.forEach(line => {
      line.geometry.dispose();
      line.material.dispose();
      this.scene.remove(line);
    });
    this.glowingPaths = [];

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
