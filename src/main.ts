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

const paperColor = new THREE.Color(SCENE_CONFIG.paperColor);
const pointer = new THREE.Vector2();
const pointerTarget = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const timer = new THREE.Timer();
timer.connect(document);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const focusPull = { value: 0 };

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
  document.body.dataset.state = state;
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
