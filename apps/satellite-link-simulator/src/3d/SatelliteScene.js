import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useLinkStore, GROUND_STATIONS } from '../store/useLinkStore';

// --------------- LEO constellation config ---------------
const LEO_SATS = [
  { id: 'leo0', angle: 0,          speed: 0.28,  inclination: 0 },
  { id: 'leo1', angle: Math.PI / 3, speed: 0.22, inclination: 0.52 },
  { id: 'leo2', angle: (2 * Math.PI) / 3, speed: 0.32, inclination: -0.4 },
  { id: 'leo3', angle: Math.PI,    speed: 0.26,  inclination: 0.8 },
  { id: 'leo4', angle: (4 * Math.PI) / 3, speed: 0.30, inclination: -0.65 },
  { id: 'leo5', angle: (5 * Math.PI) / 3, speed: 0.25, inclination: 0.3 },
];

const LEO_RADIUS = 5.5;
const GEO_RADIUS = 12.0;

export class SatelliteScene {
  constructor(container) {
    this.container = container;
    this.disposables = [];
    this.animationFrameId = null;
    this.leoSats = [];
    this.geoSats = [];
    this.lasers = [];
    this.stations = {};
    this.clock = new THREE.Clock();

    // ── Scene ──
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020811, 0.003);

    // ── Camera ──
    this.camera = new THREE.PerspectiveCamera(
      42,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 8, 22);

    // ── Renderer ──
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // ── Controls ──
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4.5;
    this.controls.maxDistance = 80;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.3;

    // ── Lighting ──
    this.scene.add(new THREE.AmbientLight(0x112244, 0.6));

    const sunLight = new THREE.DirectionalLight(0xfff4e0, 3.0);
    sunLight.position.set(30, 15, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    rimLight.position.set(-30, -10, -20);
    this.scene.add(rimLight);

    // ── Build world ──
    this.createStars();
    this.createNebula();
    this.createEarth();
    this.createOrbitLines();
    this.createGroundStations();
    this.createSatellites();
    this.createLasers();

    // ── Subscribe to store ──
    this.unsubscribe = useLinkStore.subscribe((state) => {
      this.handleStoreUpdate(state);
    });
    this.handleStoreUpdate(useLinkStore.getState());

    this.animate();
    window.addEventListener('resize', this.onResize);
  }

  // ─────────────────────────────────────────
  //  STARS + NEBULA
  // ─────────────────────────────────────────
  createStars() {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random();
      const theta = u * 2 * Math.PI;
      const phi   = Math.acos(2 * v - 1);
      const r     = 180 + Math.random() * 80;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Varied star colours: white, blue-white, warm yellow
      const t = Math.random();
      if (t < 0.6) {
        colors[i * 3] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 1.0;
      } else if (t < 0.85) {
        colors[i * 3] = 0.6;  colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0;  colors[i * 3 + 1] = 0.9;  colors[i * 3 + 2] = 0.6;
      }
      sizes[i] = 0.3 + Math.random() * 1.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
    this.scene.add(new THREE.Points(geo, mat));
    this.disposables.push(geo, mat);
  }

  createNebula() {
    // Soft glow clouds far in the background
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 160 + Math.random() * 20;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      // Nebula colors: purple / teal / pink
      const pick = Math.floor(Math.random() * 3);
      if (pick === 0) { colors[i*3]=0.5; colors[i*3+1]=0.1; colors[i*3+2]=0.8; }
      else if (pick===1){ colors[i*3]=0.1; colors[i*3+1]=0.6; colors[i*3+2]=0.8; }
      else             { colors[i*3]=0.8; colors[i*3+1]=0.2; colors[i*3+2]=0.5; }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 5, vertexColors: true, transparent: true, opacity: 0.18, sizeAttenuation: true });
    this.scene.add(new THREE.Points(geo, mat));
    this.disposables.push(geo, mat);
  }

  // ─────────────────────────────────────────
  //  EARTH – PROCEDURAL TEXTURE (high-detail)
  // ─────────────────────────────────────────
  buildEarthDiffuse() {
    const W = 2048, H = 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // === Deep-ocean gradient ===
    const oceanGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/1.6);
    oceanGrad.addColorStop(0,   '#0a1f3a');
    oceanGrad.addColorStop(0.5, '#0c2d52');
    oceanGrad.addColorStop(1,   '#071626');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, W, H);

    // === Subtle latitude lines ===
    ctx.strokeStyle = 'rgba(30, 80, 140, 0.25)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += H/12) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let x = 0; x < W; x += W/24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    // === Land helper ===
    const drawLand = (pts, fill, stroke) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Internal highlight helper
    const drawHighlight = (pts) => {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = 'transparent';
      ctx.lineWidth = 0;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.closePath();
      ctx.fill();
    };

    const green1  = '#1a5c3a';
    const green2  = '#256944';
    const greenB  = '#4ade80';

    // ── North America ──
    drawLand([
      [120,70],[230,55],[310,72],[370,95],[395,140],[360,170],
      [390,215],[355,250],[380,305],[340,350],[310,395],
      [270,440],[250,460],[215,430],[195,395],
      [185,340],[165,300],[155,255],[165,200],[135,155]
    ], green1, greenB);
    drawHighlight([[140,80],[220,65],[300,85],[340,140],[290,170],[200,150]]);

    // Central America
    drawLand([[265,455],[290,460],[285,490],[255,495],[250,465]], green2, greenB);

    // ── South America ──
    drawLand([
      [255,500],[310,480],[370,490],[405,530],[420,590],[415,660],
      [395,730],[360,800],[310,840],[275,830],[240,780],[215,710],
      [200,640],[215,575],[235,530]
    ], green1, greenB);
    drawHighlight([[270,505],[350,495],[395,560],[370,620],[295,600],[240,550]]);

    // ── Greenland ──
    drawLand([[370,35],[430,20],[470,35],[455,80],[410,95],[365,75]], '#b0d0e8', '#ddeeff');

    // ── Europe ──
    drawLand([
      [490,90],[580,72],[660,80],[700,110],[690,145],[660,155],
      [640,200],[600,210],[570,230],[540,215],[510,185],[480,165],
      [470,130]
    ], green2, greenB);

    // ── Africa ──
    drawLand([
      [510,230],[590,210],[650,220],[700,250],[730,320],[740,410],
      [720,490],[680,570],[640,630],[600,670],[565,680],[525,660],
      [500,600],[480,530],[475,450],[480,360],[490,290]
    ], green1, greenB);
    drawHighlight([[540,250],[640,250],[700,320],[680,440],[600,480],[510,410],[490,300]]);

    // ── Russia / Asia ──
    drawLand([
      [680,70],[820,50],[1000,55],[1120,80],[1180,110],[1200,155],
      [1160,200],[1100,230],[1050,270],[990,290],[940,280],
      [900,240],[840,240],[800,260],[770,300],[720,300],
      [690,260],[660,220],[640,180],[650,130]
    ], green1, greenB);
    drawHighlight([[720,75],[900,60],[1100,90],[1150,160],[1050,210],[850,200],[700,150]]);

    // ── Indian subcontinent ──
    drawLand([
      [840,260],[900,255],[945,285],[960,340],[940,400],[900,440],[860,440],[825,395],[810,330],[820,280]
    ], green2, greenB);

    // ── Southeast Asia ──
    drawLand([
      [1010,290],[1080,275],[1130,290],[1160,330],[1140,380],[1080,400],[1020,380],[990,340]
    ], green2, greenB);

    // ── China / Korea / Japan ──
    drawLand([
      [1060,210],[1130,200],[1190,215],[1220,250],[1200,285],[1150,300],[1090,295],[1050,265]
    ], green2, greenB);

    // ── Australia ──
    drawLand([
      [1080,490],[1180,480],[1260,500],[1310,560],[1300,640],[1250,690],[1180,710],[1100,700],[1060,660],[1040,590],[1055,520]
    ], green1, greenB);
    drawHighlight([[1110,505],[1220,495],[1280,560],[1260,640],[1170,660],[1080,600]]);

    // ── New Zealand ──
    drawLand([[1285,685],[1305,665],[1315,700],[1295,720],[1275,705]], green2, greenB);

    // ── Arctic ice cap ──
    ctx.fillStyle = 'rgba(200,230,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(W/2, 0, 280, 95, 0, 0, Math.PI*2);
    ctx.fill();

    // ── Antarctica ──
    ctx.fillStyle = 'rgba(220,240,255,0.8)';
    ctx.fillRect(0, H - 70, W, 70);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(W/2, H, 550, 90, 0, 0, Math.PI*2);
    ctx.fill();

    // ── City lights glow (night-side halo blobs) ──
    const cities = [
      [330,145],[360,130],[490,110],[550,115],[570,100],[590,105],
      [640,105],[660,115],[700,130],[840,130],[870,175],[900,210],
      [1040,220],[1100,225],[1155,240],[1170,260],[1180,300],
      [270,140],[280,145],[295,160]
    ];
    cities.forEach(([cx, cy]) => {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      grd.addColorStop(0,   'rgba(255, 230, 100, 0.55)');
      grd.addColorStop(0.5, 'rgba(255, 180,  50, 0.2)');
      grd.addColorStop(1,   'rgba(255, 140,   0, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(cv);
  }

  buildNightLightsTexture() {
    const W = 2048, H = 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    const blob = (cx, cy, r, alpha) => {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0,   `rgba(255, 220, 100, ${alpha})`);
      grd.addColorStop(0.4, `rgba(255, 170,  50, ${alpha * 0.5})`);
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    };

    // North America urban corridor
    blob(245,145,22,0.9); blob(265,140,18,0.85); blob(290,155,15,0.7); blob(300,160,12,0.6);
    // Europe
    blob(490,110,30,0.95); blob(545,112,20,0.8); blob(570,100,15,0.75); blob(600,108,18,0.7);
    blob(630,105,16,0.75); blob(660,112,14,0.65);
    // Russia
    blob(710,130,18,0.6); blob(760,120,14,0.5); blob(840,130,16,0.6);
    // Asia
    blob(865,178,20,0.75); blob(900,210,22,0.8); blob(1045,220,25,0.85);
    blob(1100,225,20,0.8); blob(1155,240,18,0.75); blob(1170,258,22,0.8);
    blob(1180,300,16,0.65);
    // India
    blob(855,310,16,0.6); blob(870,330,14,0.55); blob(895,350,12,0.5);
    // Australia
    blob(1185,640,16,0.65); blob(1130,660,14,0.55);
    // South America
    blob(320,575,14,0.6); blob(330,595,12,0.55);

    return new THREE.CanvasTexture(cv);
  }

  buildSpecularTexture() {
    const W = 2048, H = 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    // Oceans = white (reflective), land = black (matte)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    // Paint land areas black — same shapes as above, abbreviated
    const paintBlack = (pts) => {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.closePath(); ctx.fill();
    };
    paintBlack([[120,70],[230,55],[310,72],[395,140],[340,350],[310,395],[250,460],[185,340],[135,155]]);
    paintBlack([[255,500],[420,590],[360,800],[215,710],[200,640],[235,530]]);
    paintBlack([[490,90],[700,110],[640,200],[470,130]]);
    paintBlack([[510,230],[730,320],[680,570],[565,680],[475,450],[490,290]]);
    paintBlack([[680,70],[1200,155],[1050,270],[650,130]]);
    paintBlack([[840,260],[960,340],[860,440],[810,330]]);
    paintBlack([[1080,490],[1310,560],[1180,710],[1040,590]]);
    return new THREE.CanvasTexture(cv);
  }

  buildBumpTexture() {
    const W = 1024, H = 512;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    // Bright = elevated land / mountains
    const paintBump = (pts, shade) => {
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.moveTo(pts[0][0]/2, pts[0][1]/2);
      pts.slice(1).forEach(p => ctx.lineTo(p[0]/2, p[1]/2));
      ctx.closePath(); ctx.fill();
    };
    paintBump([[120,70],[395,140],[135,155]], '#555');
    paintBump([[255,500],[420,590],[235,530]], '#444');
    paintBump([[510,230],[730,320],[490,290]], '#555');
    paintBump([[680,70],[1200,155],[650,130]], '#666');
    paintBump([[840,260],[960,340],[810,330]], '#777');
    paintBump([[1080,490],[1310,560],[1040,590]], '#555');
    // Mountain highlights
    ctx.fillStyle = '#aaa';
    ctx.fillRect(585, 90, 40, 15);  // Alps
    ctx.fillRect(850, 130, 50, 20); // Himalayas (lighter = higher)
    ctx.fillRect(165, 170, 30, 60); // Rockies
    ctx.fillRect(290, 630, 20, 80); // Andes
    return new THREE.CanvasTexture(cv);
  }

  createEarth() {
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    const diffuse  = this.buildEarthDiffuse();
    const specular = this.buildSpecularTexture();
    const bump     = this.buildBumpTexture();
    const night    = this.buildNightLightsTexture();

    const geo = new THREE.SphereGeometry(3, 96, 96);
    const mat = new THREE.MeshPhongMaterial({
      map:         diffuse,
      specularMap: specular,
      bumpMap:     bump,
      bumpScale:   0.07,
      specular:    new THREE.Color(0x226688),
      shininess:   55,
      emissiveMap: night,
      emissive:    new THREE.Color(0xffcc44),
      emissiveIntensity: 0.45,
    });

    this.earthMesh = new THREE.Mesh(geo, mat);
    this.earthMesh.castShadow = true;
    this.earthMesh.receiveShadow = true;
    this.earthGroup.add(this.earthMesh);
    this.disposables.push(geo, mat, diffuse, specular, bump, night);

    // ── Outer atmosphere glow (BackSide, very transparent) ──
    const atmGeo = new THREE.SphereGeometry(3.18, 48, 48);
    const atmMat = new THREE.MeshBasicMaterial({
      color: 0x4488cc,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.earthGroup.add(new THREE.Mesh(atmGeo, atmMat));
    this.disposables.push(atmGeo, atmMat);

    // ── Inner halo (FrontSide, very thin glow rim) ──
    const haloGeo = new THREE.SphereGeometry(3.08, 48, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x2266bb,
      transparent: true,
      opacity: 0.06,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    this.earthGroup.add(new THREE.Mesh(haloGeo, haloMat));
    this.disposables.push(haloGeo, haloMat);

    // ── Clouds layer ──
    const cloudGeo = new THREE.SphereGeometry(3.04, 64, 64);
    const cloudTex = this.buildCloudsTexture();
    const cloudMat = new THREE.MeshBasicMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.earthGroup.add(this.cloudMesh);
    this.disposables.push(cloudGeo, cloudMat, cloudTex);
  }

  buildCloudsTexture() {
    const W = 1024, H = 512;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Random cloud patches
    for (let i = 0; i < 160; i++) {
      const cx = Math.random() * W;
      const cy = Math.random() * H;
      const rx = 30 + Math.random() * 80;
      const ry = 10 + Math.random() * 35;
      const alpha = 0.2 + Math.random() * 0.5;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      grd.addColorStop(0,   `rgba(255,255,255,${alpha})`);
      grd.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(cv);
  }

  // ─────────────────────────────────────────
  //  ORBIT RINGS
  // ─────────────────────────────────────────
  createOrbitLines() {
    const createRing = (radius, color, inclination = 0) => {
      const geo = new THREE.RingGeometry(radius - 0.018, radius + 0.018, 128);
      const mat = new THREE.MeshBasicMaterial({
        color, side: THREE.DoubleSide, transparent: true, opacity: 0.22, depthWrite: false
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = inclination;
      this.scene.add(ring);
      this.disposables.push(geo, mat);
    };

    // Multiple inclined LEO rings to suggest a constellation
    createRing(LEO_RADIUS, 0x10b981, 0);
    createRing(LEO_RADIUS, 0x10b981, 0.52);
    createRing(LEO_RADIUS, 0x10b981, -0.4);
    createRing(LEO_RADIUS, 0x10b981, 0.8);
    // GEO ring (equatorial, bright)
    const geoGeo = new THREE.RingGeometry(GEO_RADIUS - 0.025, GEO_RADIUS + 0.025, 128);
    const geoMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false
    });
    const geoRing = new THREE.Mesh(geoGeo, geoMat);
    geoRing.rotation.x = Math.PI / 2;
    this.scene.add(geoRing);
    this.disposables.push(geoGeo, geoMat);
  }

  // ─────────────────────────────────────────
  //  GROUND STATIONS
  // ─────────────────────────────────────────
  latLonToVec3(lat, lon, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.sin(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.cos(theta)
    );
  }

  createGroundStations() {
    const dotGeo = new THREE.SphereGeometry(0.07, 16, 16);
    this.disposables.push(dotGeo);

    Object.keys(GROUND_STATIONS).forEach((key) => {
      const data = GROUND_STATIONS[key];
      const pos  = this.latLonToVec3(data.lat, data.lon, 3);

      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
      const dot    = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      this.earthGroup.add(dot);
      this.stations[key] = { mesh: dot, mat: dotMat };

      // Pulsing ring
      const rGeo = new THREE.RingGeometry(0.09, 0.13, 32);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      this.earthGroup.add(ring);

      // Save pulse ring reference
      this.stations[key].ring    = ring;
      this.stations[key].ringMat = rMat;
      this.disposables.push(dotMat, rGeo, rMat);
    });
  }

  // ─────────────────────────────────────────
  //  SATELLITES
  // ─────────────────────────────────────────
  buildSatelliteMesh(bodyColor) {
    const group = new THREE.Group();

    // Body
    const bGeo = new THREE.BoxGeometry(0.28, 0.28, 0.38);
    const bMat = new THREE.MeshPhongMaterial({ color: bodyColor, shininess: 120, specular: 0xffffff });
    group.add(new THREE.Mesh(bGeo, bMat));

    // Solar panels (2 wings)
    const pGeo = new THREE.BoxGeometry(0.85, 0.018, 0.22);
    const pMat = new THREE.MeshPhongMaterial({ color: 0x1e3a8a, shininess: 60, specular: 0x446688 });
    [-0.6, 0.6].forEach(xOff => {
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.x = xOff;
      group.add(p);
    });

    // Dish
    const dGeo = new THREE.ConeGeometry(0.13, 0.18, 16);
    const dMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 80 });
    const dish = new THREE.Mesh(dGeo, dMat);
    dish.position.y = -0.22;
    dish.rotation.x = Math.PI;
    group.add(dish);

    // Glow point at dish tip
    const glowGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: bodyColor });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = -0.38;
    group.add(glow);

    this.disposables.push(bGeo, bMat, pGeo, pMat, dGeo, dMat, glowGeo, glowMat);
    return group;
  }

  createSatellites() {
    // 6 LEO satellites in inclined planes
    LEO_SATS.forEach((cfg) => {
      const sat = this.buildSatelliteMesh(0xd97706); // Gold
      this.scene.add(sat);
      this.leoSats.push({ mesh: sat, ...cfg });
    });

    // 3 GEO satellites at different equatorial longitudes
    [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].forEach((angle, i) => {
      const sat = this.buildSatelliteMesh(0xef4444); // Red
      this.scene.add(sat);
      this.geoSats.push({ mesh: sat, angle });
    });
  }

  // ─────────────────────────────────────────
  //  LASERS (one per LEO + one per GEO = 9 total beams available)
  // ─────────────────────────────────────────
  createLasers() {
    const makeLaser = (color) => {
      const geo = new THREE.CylinderGeometry(0.032, 0.032, 1, 8);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      this.disposables.push(geo, mat);
      return { mesh, mat };
    };

    // One beam per LEO sat
    this.leoSats.forEach(sat => {
      sat.laser = makeLaser(0x00ffaa);
    });
    // One beam per GEO sat
    this.geoSats.forEach(sat => {
      sat.laser = makeLaser(0xff4466);
    });
  }

  positionLaser(laser, from, to) {
    const dir  = new THREE.Vector3().subVectors(to, from);
    const len  = dir.length();
    const mid  = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    laser.mesh.position.copy(mid);
    laser.mesh.scale.set(1, len, 1);
    laser.mesh.lookAt(from);
    laser.mesh.rotateX(Math.PI / 2);
  }

  // ─────────────────────────────────────────
  //  STORE UPDATE HANDLER
  // ─────────────────────────────────────────
  handleStoreUpdate(state) {
    if (!this.stations) return;
    Object.keys(this.stations).forEach((key) => {
      const isActive = key === state.activeGroundStation;
      this.stations[key].mat.color.setHex(isActive ? 0xfff000 : 0x00ffcc);
      this.stations[key].ringMat.color.setHex(isActive ? 0xfff000 : 0x00ffcc);
    });
  }

  // ─────────────────────────────────────────
  //  ANIMATE
  // ─────────────────────────────────────────
  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const t   = this.clock.getElapsedTime();
    const { orbitType, activeGroundStation, linkStatus } = useLinkStore.getState();

    // ── Earth rotation ──
    if (this.earthGroup) this.earthGroup.rotation.y = t * 0.06;
    if (this.cloudMesh)  this.cloudMesh.rotation.y  = t * 0.07;

    // ── LEO satellites ──
    const leoPositions = [];
    this.leoSats.forEach((sat) => {
      const angle = sat.angle + t * sat.speed;
      const inc   = sat.inclination;
      const pos = new THREE.Vector3(
        Math.cos(angle) * LEO_RADIUS,
        Math.sin(angle) * LEO_RADIUS * Math.sin(inc),
        Math.sin(angle) * LEO_RADIUS * Math.cos(inc)
      );
      sat.mesh.position.copy(pos);
      sat.mesh.lookAt(0, 0, 0);
      leoPositions.push(pos);
    });

    // ── GEO satellites (geostationary = locked to Earth's angle) ──
    const earthAngle = this.earthGroup ? this.earthGroup.rotation.y : 0;
    const geoPositions = [];
    this.geoSats.forEach((sat) => {
      const ang = sat.angle + earthAngle;
      const pos = new THREE.Vector3(Math.cos(ang) * GEO_RADIUS, 0, Math.sin(ang) * GEO_RADIUS);
      sat.mesh.position.copy(pos);
      sat.mesh.lookAt(0, 0, 0);
      geoPositions.push(pos);
    });

    // ── Pulsing ground station rings ──
    const pulse = 0.65 + 0.35 * Math.sin(t * 3.5);
    Object.values(this.stations).forEach(s => {
      if (s.ringMat) s.ringMat.opacity = 0.3 + 0.5 * pulse;
    });

    // ── Determine active station world position ──
    const activeStnMesh = this.stations[activeGroundStation]?.mesh;
    let stationWorldPos = null;
    if (activeStnMesh) {
      stationWorldPos = new THREE.Vector3();
      activeStnMesh.getWorldPosition(stationWorldPos);
    }

    // ── Link status beam opacity ──
    const baseOpacity = linkStatus === 'Stable'      ? 0.7
                      : linkStatus === 'Degraded'    ? 0.35
                      :                               0.06;
    const beamColor = linkStatus === 'Stable'      ? 0x00ffaa
                    : linkStatus === 'Degraded'    ? 0xf59e0b
                    :                               0xef4444;

    // ── Update laser beams ──
    const activeLeoSats = orbitType === 'LEO' ? this.leoSats : [];
    const activeGeoSats = orbitType === 'GEO' ? this.geoSats : [];

    this.leoSats.forEach((sat, i) => {
      const isActive = orbitType === 'LEO';
      const opacity  = isActive
        ? baseOpacity * (0.8 + 0.2 * Math.sin(t * 8 + i)) 
        : 0;
      sat.laser.mat.opacity = opacity;
      sat.laser.mat.color.setHex(isActive ? beamColor : 0x00ffaa);
      if (isActive && stationWorldPos) {
        this.positionLaser(sat.laser, leoPositions[i], stationWorldPos);
      }
    });

    this.geoSats.forEach((sat, i) => {
      const isActive = orbitType === 'GEO';
      const opacity  = isActive
        ? baseOpacity * (0.7 + 0.3 * Math.sin(t * 5 + i * 2))
        : 0;
      sat.laser.mat.opacity = opacity;
      sat.laser.mat.color.setHex(isActive ? beamColor : 0xff4466);
      if (isActive && stationWorldPos) {
        this.positionLaser(sat.laser, geoPositions[i], stationWorldPos);
      }
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  onResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    if (this.unsubscribe) this.unsubscribe();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.disposables.forEach(d => d.dispose());
  }
}
