import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import {
  createDistanceMaterial,
  createGroundMaterial,
  createRepairMaterial,
  paperPassShader,
} from './shaders';
import { SCENE_CONFIG } from './sceneConfig';

type RestorationState = 'broken' | 'restoring' | 'restored' | 'reversing';

type RepairFragment = {
  mesh: THREE.Mesh<THREE.TetrahedronGeometry, THREE.MeshBasicMaterial>;
  start: THREE.Vector3;
  target: THREE.Vector3;
  spin: THREE.Vector3;
  phase: number;
  baseScale: number;
};

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`页面缺少必要元素：${selector}`);
  return element;
}

const canvas = requireElement<HTMLCanvasElement>('#scene');
const loading = requireElement<HTMLDivElement>('#loading');
const fallback = requireElement<HTMLDivElement>('#fallback');
const restoreButton = requireElement<HTMLButtonElement>('#restore');
const buttonLabel = requireElement<HTMLSpanElement>('#button-label');
const statusLabel = requireElement<HTMLParagraphElement>('#status');
const completionNote = requireElement<HTMLParagraphElement>('.completion-note');

const paperColor = new THREE.Color(SCENE_CONFIG.paperColor);
const pointer = new THREE.Vector2();
const pointerTarget = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const timer = new THREE.Timer();
timer.connect(document);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const focusPull = { value: 0 };
const repairFragments: RepairFragment[] = [];

let restorationState: RestorationState = 'broken';
let statueMesh: THREE.Mesh | null = null;
let repairMaterial: THREE.ShaderMaterial | null = null;
let particleMaterial: THREE.ShaderMaterial | null = null;
let renderer: THREE.WebGLRenderer;
let composer: EffectComposer;
let camera: THREE.PerspectiveCamera;

function setCopy(state: RestorationState) {
  const copy = {
    broken: ['石像仍沉睡在残缺之中', '触碰石像 · 开始修复'],
    restoring: ['碎石与记忆正在归位', '修复进行中'],
    restored: ['失落的面容已经复原', '再次触碰 · 回到残像'],
    reversing: ['时间重新漫过石面', '正在回溯'],
  } as const;

  statusLabel.textContent = copy[state][0];
  buttonLabel.textContent = copy[state][1];
  restoreButton.disabled = state === 'restoring' || state === 'reversing';
  restoreButton.setAttribute('aria-busy', String(state === 'restoring' || state === 'reversing'));
  restoreButton.setAttribute('aria-pressed', String(state === 'restored'));
  restoreButton.setAttribute('aria-label', copy[state][1]);
  completionNote.setAttribute('aria-hidden', String(state !== 'restored'));
  if (state === 'broken' || state === 'restored') {
    document.documentElement.style.setProperty('--repair-progress', state === 'restored' ? '1' : '0');
  }
  document.body.dataset.state = state;
}

function updateRestorationFeedback(progress: number, restoring: boolean) {
  const safeProgress = THREE.MathUtils.clamp(progress, 0, 1);
  const percentage = Math.round(safeProgress * 100);
  document.documentElement.style.setProperty('--repair-progress', safeProgress.toFixed(4));

  if (restoring) {
    if (safeProgress < 0.14) statusLabel.textContent = '缺损边缘正在苏醒';
    else if (safeProgress < 0.5) statusLabel.textContent = '散落石片正在聚合';
    else if (safeProgress < 0.84) statusLabel.textContent = '失落的面容正在补全';
    else statusLabel.textContent = '修复正在收束';
    buttonLabel.textContent = `修复进行中 · ${percentage}%`;
    restoreButton.setAttribute('aria-label', `石像修复进度 ${percentage}%`);
  } else {
    statusLabel.textContent = safeProgress > 0.3 ? '时间正在重新漫过石面' : '残缺形态正在显现';
    buttonLabel.textContent = `回溯进行中 · ${percentage}%`;
    restoreButton.setAttribute('aria-label', `石像回溯进度 ${percentage}%`);
  }
}

function toggleRestoration() {
  if (!repairMaterial || !particleMaterial) return;
  if (restorationState === 'restoring' || restorationState === 'reversing') return;

  const restoring = restorationState === 'broken';
  restorationState = restoring ? 'restoring' : 'reversing';
  setCopy(restorationState);

  const target = restoring ? 1 : 0;
  const duration = reducedMotion
    ? 0.01
    : restoring
      ? SCENE_CONFIG.restoration.forwardDuration
      : SCENE_CONFIG.restoration.reverseDuration;

  gsap.to(repairMaterial.uniforms.uProgress, {
    value: target,
    duration,
    ease: restoring ? 'power2.inOut' : 'power2.out',
    onUpdate: () => {
      if (particleMaterial && repairMaterial) {
        particleMaterial.uniforms.uProgress.value = repairMaterial.uniforms.uProgress.value;
        updateRestorationFeedback(repairMaterial.uniforms.uProgress.value, restoring);
      }
    },
    onComplete: () => {
      restorationState = restoring ? 'restored' : 'broken';
      setCopy(restorationState);
    },
  });

  gsap.to(focusPull, {
    value: restoring ? 1 : 0,
    duration: reducedMotion ? 0.01 : restoring ? 1.55 : 0.85,
    ease: 'sine.inOut',
  });

  gsap.fromTo(
    '.interaction-panel',
    { x: 0 },
    { x: restoring ? -8 : 0, duration: 0.55, yoyo: true, repeat: 1, ease: 'sine.inOut' },
  );
}

function makeContactShadow() {
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 512;
  shadowCanvas.height = 160;
  const context = shadowCanvas.getContext('2d');
  if (!context) throw new Error('无法创建接触阴影纹理。');
  const gradient = context.createRadialGradient(256, 80, 10, 256, 80, 230);
  gradient.addColorStop(0, 'rgba(83, 69, 45, 0.30)');
  gradient.addColorStop(0.5, 'rgba(83, 69, 45, 0.12)');
  gradient.addColorStop(1, 'rgba(83, 69, 45, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 160);
  const texture = new THREE.CanvasTexture(shadowCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const [statueX, , statueZ] = SCENE_CONFIG.layers.statue.position;
  sprite.position.set(statueX, -2.75, statueZ - 0.25);
  sprite.scale.set(13.5, 3.1, 1);
  return sprite;
}

function makeParticles() {
  const count = 150;
  const positions = new Float32Array(count * 3);
  const offsets = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.5 + Math.random() * 4.8;
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    offsets[i * 3] = Math.cos(angle) * radius;
    offsets[i * 3 + 1] = (Math.random() - 0.2) * radius * 0.85;
    offsets[i * 3 + 2] = (Math.random() - 0.5) * 2.6;
    sizes[i] = 3 + Math.random() * 8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color('#b49a70') },
    },
    vertexShader: `
      attribute vec3 aOffset;
      attribute float aSize;
      uniform float uTime;
      uniform float uProgress;
      varying float vAlpha;
      void main() {
        float wave = sin(uTime * 2.1 + aOffset.x * 1.7) * 0.13;
        vec3 drift = aOffset * (1.0 - uProgress);
        drift.y += wave * sin(3.14159 * uProgress);
        vec4 mvPosition = modelViewMatrix * vec4(position + drift, 1.0);
        gl_PointSize = aSize * (230.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = sin(3.14159 * uProgress) * 0.7;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.08, d) * vAlpha;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });

  const particles = new THREE.Points(geometry, particleMaterial);
  const [statueX, , statueZ] = SCENE_CONFIG.layers.statue.position;
  particles.position.set(statueX, 5.6, statueZ + 0.7);
  return particles;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRepairFragments() {
  const group = new THREE.Group();
  const random = seededRandom(20260922);
  const geometry = new THREE.TetrahedronGeometry(0.22, 0);
  const palette = ['#d5c29e', '#bda884', '#9d8a6e', '#e0d1b2'];
  const [statueX, , statueZ] = SCENE_CONFIG.layers.statue.position;

  group.position.set(statueX, 7.55, statueZ + 0.62);

  for (let index = 0; index < 16; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 1.9 + random() * 3.7;
    const start = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.7 + (random() - 0.5) * 1.2,
      (random() - 0.5) * 2.8,
    );
    const target = new THREE.Vector3(
      (random() - 0.5) * 1.55,
      (random() - 0.5) * 2.15,
      (random() - 0.5) * 0.35,
    );
    const material = new THREE.MeshBasicMaterial({
      color: palette[index % palette.length],
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const baseScale = 0.45 + random() * 0.85;
    mesh.position.copy(start);
    mesh.scale.setScalar(baseScale);
    mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    mesh.renderOrder = 7;
    mesh.visible = false;
    group.add(mesh);
    repairFragments.push({
      mesh,
      start,
      target,
      spin: new THREE.Vector3(0.45 + random(), 0.5 + random(), 0.35 + random()),
      phase: random() * Math.PI * 2,
      baseScale,
    });
  }

  return group;
}

function updateRepairFragments(progress: number, time: number) {
  const visible = progress > 0.012 && progress < 0.988;
  const travel = THREE.MathUtils.smoothstep(progress, 0.08, 0.88);
  const opacity = Math.sin(Math.PI * THREE.MathUtils.clamp(progress, 0, 1)) * 0.72;

  for (const fragment of repairFragments) {
    fragment.mesh.visible = visible;
    if (!visible) continue;

    fragment.mesh.position.lerpVectors(fragment.start, fragment.target, travel);
    fragment.mesh.position.y += Math.sin(time * 2.2 + fragment.phase) * 0.1 * (1 - travel);
    fragment.mesh.rotation.x = time * fragment.spin.x + fragment.phase;
    fragment.mesh.rotation.y = time * fragment.spin.y + fragment.phase * 0.7;
    fragment.mesh.rotation.z = time * fragment.spin.z;
    fragment.mesh.scale.setScalar(fragment.baseScale * (1 - travel * 0.38));
    fragment.mesh.material.opacity = opacity;
  }
}

async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    fallback.hidden = false;
    loading.remove();
    throw error;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(paperColor, 1);

  const scene = new THREE.Scene();
  scene.background = paperColor;

  camera = new THREE.PerspectiveCamera(
    SCENE_CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    SCENE_CONFIG.camera.near,
    SCENE_CONFIG.camera.far,
  );
  camera.position.set(...SCENE_CONFIG.camera.position);
  camera.lookAt(...SCENE_CONFIG.camera.lookAt);

  const loader = new THREE.TextureLoader();
  const [backgroundTexture, pagodaTexture, terrainTexture, brokenTexture, intactTexture] = await Promise.all([
    loader.loadAsync(SCENE_CONFIG.assets.background),
    loader.loadAsync(SCENE_CONFIG.assets.pagoda),
    loader.loadAsync(SCENE_CONFIG.assets.terrain),
    loader.loadAsync(SCENE_CONFIG.assets.statueBroken),
    loader.loadAsync(SCENE_CONFIG.assets.statueIntact),
  ]);

  for (const texture of [backgroundTexture, pagodaTexture, terrainTexture, brokenTexture, intactTexture]) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }

  const backgroundConfig = SCENE_CONFIG.layers.background;
  const backgroundMaterial = createDistanceMaterial(backgroundTexture, {
    paperColor,
    nearDistance: backgroundConfig.dissolve[0],
    farDistance: backgroundConfig.dissolve[1],
    maxDissolve: backgroundConfig.dissolve[2],
  });
  const background = new THREE.Mesh(new THREE.PlaneGeometry(...backgroundConfig.size), backgroundMaterial);
  background.position.set(...backgroundConfig.position);
  scene.add(background);

  const atmosphereConfig = SCENE_CONFIG.layers.atmosphere;
  const atmosphere = new THREE.Mesh(
    new THREE.PlaneGeometry(...atmosphereConfig.size),
    new THREE.MeshBasicMaterial({
      color: SCENE_CONFIG.paperColor,
      transparent: true,
      opacity: atmosphereConfig.opacity,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  atmosphere.position.set(...atmosphereConfig.position);
  scene.add(atmosphere);

  const pagodaConfig = SCENE_CONFIG.layers.pagoda;
  const pagodaMaterial = createDistanceMaterial(pagodaTexture, {
    paperColor,
    nearDistance: pagodaConfig.dissolve[0],
    farDistance: pagodaConfig.dissolve[1],
    maxDissolve: pagodaConfig.dissolve[2],
    transparent: true,
    opacity: pagodaConfig.opacity,
  });
  const pagoda = new THREE.Mesh(new THREE.PlaneGeometry(...pagodaConfig.size), pagodaMaterial);
  pagoda.position.set(...pagodaConfig.position);
  pagoda.renderOrder = 2;
  scene.add(pagoda);

  const groundConfig = SCENE_CONFIG.layers.ground;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(...groundConfig.size), createGroundMaterial());
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(...groundConfig.position);
  scene.add(ground);

  scene.add(makeContactShadow());

  const statueConfig = SCENE_CONFIG.layers.statue;
  const statueGeometry = new THREE.PlaneGeometry(...statueConfig.size);
  const brokenMaterial = createDistanceMaterial(brokenTexture, {
    paperColor,
    nearDistance: statueConfig.dissolve[0],
    farDistance: statueConfig.dissolve[1],
    maxDissolve: statueConfig.dissolve[2],
    transparent: true,
  });
  statueMesh = new THREE.Mesh(statueGeometry, brokenMaterial);
  statueMesh.position.set(...statueConfig.position);
  statueMesh.renderOrder = 5;
  scene.add(statueMesh);

  repairMaterial = createRepairMaterial(intactTexture);
  const restoredStatue = new THREE.Mesh(statueGeometry, repairMaterial);
  restoredStatue.position.set(statueConfig.position[0], statueConfig.position[1], statueConfig.position[2] + 0.04);
  restoredStatue.renderOrder = 6;
  scene.add(restoredStatue);

  scene.add(makeParticles());
  scene.add(makeRepairFragments());

  const terrainConfig = SCENE_CONFIG.layers.terrain;
  const terrainMaterial = createDistanceMaterial(terrainTexture, {
    paperColor,
    nearDistance: terrainConfig.dissolve[0],
    farDistance: terrainConfig.dissolve[1],
    maxDissolve: terrainConfig.dissolve[2],
    transparent: true,
    opacity: terrainConfig.opacity,
  });
  const terrain = new THREE.Mesh(new THREE.PlaneGeometry(...terrainConfig.size), terrainMaterial);
  terrain.position.set(...terrainConfig.position);
  terrain.renderOrder = 8;
  scene.add(terrain);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const paperPass = new ShaderPass(paperPassShader);
  paperPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  composer.addPass(paperPass);

  const cameraCurrent = new THREE.Vector3(...SCENE_CONFIG.camera.position);
  const cameraTarget = cameraCurrent.clone();

  function render(timestamp?: number) {
    timer.update(timestamp);
    const time = timer.getElapsed();
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = Math.min(1, window.scrollY / maxScroll);

    cameraTarget.x = pointerTarget.x * SCENE_CONFIG.camera.pointerTravel[0];
    cameraTarget.y = SCENE_CONFIG.camera.position[1] - pointerTarget.y * SCENE_CONFIG.camera.pointerTravel[1];
    cameraTarget.z =
      SCENE_CONFIG.camera.position[2] -
      scrollProgress * SCENE_CONFIG.camera.scrollTravel -
      focusPull.value * SCENE_CONFIG.camera.restorationFocusTravel;
    cameraCurrent.lerp(cameraTarget, reducedMotion ? 1 : SCENE_CONFIG.camera.damping);
    camera.position.copy(cameraCurrent);
    camera.lookAt(...SCENE_CONFIG.camera.lookAt);

    if (repairMaterial) repairMaterial.uniforms.uTime.value = time;
    if (particleMaterial) particleMaterial.uniforms.uTime.value = time;
    if (repairMaterial) updateRepairFragments(repairMaterial.uniforms.uProgress.value, time);
    paperPass.uniforms.uTime.value = time;

    composer.render();
    requestAnimationFrame(render);
  }

  window.addEventListener('pointermove', (event) => {
    pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;

    pointer.set(pointerTarget.x, pointerTarget.y);
    raycaster.setFromCamera(pointer, camera);
    const hovering = statueMesh ? raycaster.intersectObject(statueMesh).length > 0 : false;
    canvas.classList.toggle('is-interactive', hovering);
  });

  canvas.addEventListener('click', (event) => {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    if (statueMesh && raycaster.intersectObject(statueMesh).length > 0) toggleRestoration();
  });

  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    paperPass.uniforms.uResolution.value.set(width, height);
  });

  restoreButton.addEventListener('click', toggleRestoration);
  setCopy('broken');
  render();

  loading.classList.add('is-hidden');
  window.setTimeout(() => loading.remove(), 850);
}

init().catch((error: unknown) => {
  console.error('场景初始化失败：', error);
  fallback.hidden = false;
  loading.remove();
});
