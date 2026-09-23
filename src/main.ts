import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import {
  createDistanceMaterial,
  createGroundMaterial,
  createHoverOutlineMaterial,
  createRepairMaterial,
  paperPassShader,
} from './shaders';
import { ACTIVE_SCENE_ID, SCENE_CONFIG, type RestorationSceneConfig } from './sceneConfig';

type RestorationState = 'broken' | 'restoring' | 'restored' | 'reversing';
type FragmentAtlas = NonNullable<RestorationSceneConfig['assets']['fragments']>;
type AlphaMask = { width: number; height: number; pixels: Uint8Array; flipY: boolean };

type RepairFragment = {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  start: THREE.Vector3;
  target: THREE.Vector3;
  spin: THREE.Vector3;
  phase: number;
  baseScale: number;
  billboard: boolean;
};

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`页面缺少必要元素：${selector}`);
  return element;
}

const canvas = requireElement<HTMLCanvasElement>('#scene');
const sceneShell = requireElement<HTMLDivElement>('.scene-shell');
const eyebrow = requireElement<HTMLParagraphElement>('.eyebrow');
const pageTitle = requireElement<HTMLHeadingElement>('#page-title');
const lede = requireElement<HTMLParagraphElement>('.lede');
const chapter = requireElement<HTMLSpanElement>('.chapter');
const hint = requireElement<HTMLParagraphElement>('.hint');
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
const focusDim = { value: 0 };
const repairFragments: RepairFragment[] = [];

let restorationState: RestorationState = 'broken';
let subjectMesh: THREE.Mesh | null = null;
let subjectMaterial: THREE.ShaderMaterial | null = null;
let hoverOutlineMaterial: THREE.ShaderMaterial | null = null;
let subjectTextures: { broken: THREE.Texture; intact: THREE.Texture } | null = null;
let subjectAlphaMasks: { broken: AlphaMask; intact: AlphaMask } | null = null;
let repairMaterial: THREE.ShaderMaterial | null = null;
let particleMaterial: THREE.ShaderMaterial | null = null;
let hoverStrengthTarget = 0;
let pageVisible = !document.hidden;
let renderer: THREE.WebGLRenderer;
let composer: EffectComposer;
let camera: THREE.PerspectiveCamera;

function validateSceneConfig(config: RestorationSceneConfig) {
  const subject = config.layers.subject;
  if (Boolean(config.assets.midground) !== Boolean(config.layers.midground)) {
    throw new Error(`场景 ${config.id} 的中景素材与中景图层必须同时配置或同时省略。`);
  }
  if (subject.damageCenter.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new Error(`场景 ${config.id} 的缺损中心必须在 0–1 之间。`);
  }
  if (subject.damageRadius.some((value) => !Number.isFinite(value) || value <= 0 || value > 1)) {
    throw new Error(`场景 ${config.id} 的缺损半径必须大于 0 且不超过 1。`);
  }
}

function getValidFragmentAtlas(config: RestorationSceneConfig): FragmentAtlas | null {
  const atlas = config.assets.fragments;
  if (!atlas) return null;
  if (!Number.isInteger(atlas.columns) || !Number.isInteger(atlas.rows) ||
    !Number.isInteger(atlas.count) || atlas.columns < 1 || atlas.rows < 1 ||
    atlas.count < 1 || atlas.count !== atlas.columns * atlas.rows) {
    console.warn(`场景 ${config.id} 的碎片图集行列数与数量不匹配，已使用程序化碎片。`);
    return null;
  }
  return atlas;
}

async function loadTexture(loader: THREE.TextureLoader, path: string) {
  try {
    return await loader.loadAsync(path);
  } catch (cause) {
    throw new Error(`场景 ${ACTIVE_SCENE_ID} 无法加载素材：${path}`, { cause });
  }
}

function assertMatchingSubjectSize(broken: THREE.Texture, intact: THREE.Texture) {
  const brokenImage = broken.image as { width: number; height: number };
  const intactImage = intact.image as { width: number; height: number };
  if (brokenImage.width !== intactImage.width || brokenImage.height !== intactImage.height) {
    throw new Error(
      `场景 ${ACTIVE_SCENE_ID} 的残缺态与完整态尺寸不一致：` +
      `${brokenImage.width}×${brokenImage.height} / ${intactImage.width}×${intactImage.height}。`,
    );
  }
}

function readAlphaMask(texture: THREE.Texture): AlphaMask {
  const image = texture.image as HTMLImageElement;
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error(`场景 ${ACTIVE_SCENE_ID} 无法读取主物件透明通道。`);
  context.drawImage(image, 0, 0);
  const rgba = context.getImageData(0, 0, image.width, image.height).data;
  const pixels = new Uint8Array(image.width * image.height);
  for (let index = 0; index < pixels.length; index++) pixels[index] = rgba[index * 4 + 3];
  return { width: image.width, height: image.height, pixels, flipY: texture.flipY };
}

function isSubjectHit(): boolean {
  if (!subjectMesh || !subjectAlphaMasks) return false;
  const intersection = raycaster.intersectObject(subjectMesh)[0];
  if (!intersection?.uv) return false;
  const mask = restorationState === 'restored' ? subjectAlphaMasks.intact : subjectAlphaMasks.broken;
  const x = THREE.MathUtils.clamp(Math.floor(intersection.uv.x * mask.width), 0, mask.width - 1);
  const imageY = mask.flipY ? 1 - intersection.uv.y : intersection.uv.y;
  const y = THREE.MathUtils.clamp(Math.floor(imageY * mask.height), 0, mask.height - 1);
  return mask.pixels[y * mask.width + x] >= 13;
}

function applySceneCopy() {
  const { copy } = SCENE_CONFIG;
  document.title = copy.documentTitle;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', copy.lead);
  sceneShell.setAttribute('aria-label', copy.ariaLabel);
  sceneShell.style.setProperty('--fallback-image', `url("${SCENE_CONFIG.assets.background}")`);
  eyebrow.textContent = copy.eyebrow;
  pageTitle.textContent = copy.title;
  lede.textContent = copy.lead;
  chapter.textContent = copy.chapter;
  hint.textContent = copy.directHint;

  document.querySelectorAll<HTMLAnchorElement>('[data-scene]').forEach((link) => {
    if (link.dataset.scene === ACTIVE_SCENE_ID) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function setCopy(state: RestorationState) {
  const { copy: sceneCopy } = SCENE_CONFIG;
  const copy = {
    broken: [sceneCopy.brokenStatus, sceneCopy.brokenAction],
    restoring: ['碎石与记忆正在归位', '修复进行中'],
    restored: [sceneCopy.restoredStatus, sceneCopy.restoredAction],
    reversing: ['时间重新漫过石面', '正在回溯'],
  } as const;

  statusLabel.textContent = copy[state][0];
  buttonLabel.textContent = copy[state][1];
  restoreButton.disabled = state === 'restoring' || state === 'reversing';
  restoreButton.setAttribute('aria-busy', String(state === 'restoring' || state === 'reversing'));
  restoreButton.setAttribute('aria-pressed', String(state === 'restored'));
  restoreButton.setAttribute('aria-label', copy[state][1]);
  completionNote.setAttribute('aria-hidden', String(state !== 'restored'));
  if (state === 'restoring' || state === 'reversing') hoverStrengthTarget = 0;
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
    if (safeProgress < 0.14) statusLabel.textContent = SCENE_CONFIG.copy.phaseWake;
    else if (safeProgress < 0.5) statusLabel.textContent = SCENE_CONFIG.copy.phaseGather;
    else if (safeProgress < 0.84) statusLabel.textContent = SCENE_CONFIG.copy.phaseRepair;
    else statusLabel.textContent = SCENE_CONFIG.copy.phaseSettle;
    buttonLabel.textContent = `修复进行中 · ${percentage}%`;
    restoreButton.setAttribute('aria-label', `${SCENE_CONFIG.copy.title}修复进度 ${percentage}%`);
  } else {
    statusLabel.textContent = safeProgress > 0.3 ? '时间正在重新漫过石面' : '残缺形态正在显现';
    buttonLabel.textContent = `回溯进行中 · ${percentage}%`;
    restoreButton.setAttribute('aria-label', `${SCENE_CONFIG.copy.title}回溯进度 ${percentage}%`);
  }
}

function getDamageWorldPosition(zOffset = 0) {
  const subject = SCENE_CONFIG.layers.subject;
  return new THREE.Vector3(
    subject.position[0] + (subject.damageCenter[0] - 0.5) * subject.size[0],
    subject.position[1] + (subject.damageCenter[1] - 0.5) * subject.size[1],
    subject.position[2] + zOffset,
  );
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
      if (hoverOutlineMaterial && subjectTextures) {
        hoverOutlineMaterial.uniforms.uMap.value = restoring ? subjectTextures.intact : subjectTextures.broken;
      }
      setCopy(restorationState);
      if (restoring) {
        gsap.to(focusDim, { value: 0, duration: reducedMotion ? 0.01 : 0.5, ease: 'sine.out' });
      }
    },
  });

  gsap.killTweensOf(focusDim);
  gsap.to(focusDim, {
    value: restoring ? 0.08 : 0,
    duration: reducedMotion ? 0.01 : restoring ? 0.3 : 0.45,
    ease: 'sine.out',
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
  const subject = SCENE_CONFIG.layers.subject;
  sprite.position.set(
    subject.position[0],
    subject.position[1] - subject.size[1] / 2 + 0.6,
    subject.position[2] - 0.25,
  );
  sprite.scale.set(subject.size[0] * 0.92, 3.1, 1);
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
        drift.y += wave * (0.14 + sin(3.14159 * uProgress));
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
  particles.position.copy(getDamageWorldPosition(0.7));
  particles.visible = false;
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

function makeRepairFragments(atlasTexture: THREE.Texture | null, atlas: FragmentAtlas | null) {
  const group = new THREE.Group();
  const random = seededRandom(20260922);
  const subject = SCENE_CONFIG.layers.subject;
  const palette = subject.fragmentColors;
  group.position.copy(getDamageWorldPosition(0.62));
  const fragmentCount = atlasTexture && atlas ? atlas.count : 16;

  for (let index = 0; index < fragmentCount; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 0.4 * subject.fragmentSpread + random() * 0.78 * subject.fragmentSpread;
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
    const fragmentMap = atlasTexture && atlas ? atlasTexture.clone() : null;
    if (fragmentMap && atlas) {
      const column = index % atlas.columns;
      const row = Math.floor(index / atlas.columns);
      const cellWidth = 1 / atlas.columns;
      const cellHeight = 1 / atlas.rows;
      fragmentMap.repeat.set(cellWidth, cellHeight);
      fragmentMap.offset.set(column * cellWidth, 1 - (row + 1) * cellHeight);
      fragmentMap.needsUpdate = true;
    }
    const material = new THREE.MeshBasicMaterial({
      color: fragmentMap ? '#ffffff' : palette[index % palette.length],
      map: fragmentMap,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      alphaTest: fragmentMap ? 0.025 : 0,
      toneMapped: false,
    });
    const geometry = fragmentMap
      ? new THREE.PlaneGeometry(2.35, 1.18)
      : new THREE.TetrahedronGeometry(0.22, 0);
    const mesh = new THREE.Mesh(geometry, material);
    const baseScale = fragmentMap ? 0.62 + random() * 0.42 : 0.45 + random() * 0.85;
    mesh.position.copy(start);
    mesh.scale.setScalar(baseScale);
    mesh.rotation.set(
      fragmentMap ? 0 : random() * Math.PI,
      fragmentMap ? 0 : random() * Math.PI,
      random() * Math.PI,
    );
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
      billboard: Boolean(fragmentMap),
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
    if (fragment.billboard) {
      fragment.mesh.rotation.x = 0;
      fragment.mesh.rotation.y = 0;
      fragment.mesh.rotation.z = Math.sin(time * 1.4 + fragment.phase) * 0.22 * (1 - travel);
    } else {
      fragment.mesh.rotation.x = time * fragment.spin.x + fragment.phase;
      fragment.mesh.rotation.y = time * fragment.spin.y + fragment.phase * 0.7;
      fragment.mesh.rotation.z = time * fragment.spin.z;
    }
    fragment.mesh.scale.setScalar(fragment.baseScale * (1 - travel * 0.38));
    fragment.mesh.material.opacity = opacity;
  }
}

async function init() {
  validateSceneConfig(SCENE_CONFIG);
  const fragmentAtlas = getValidFragmentAtlas(SCENE_CONFIG);
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
  const fragmentTexturePromise = fragmentAtlas
    ? loadTexture(loader, fragmentAtlas.path)
    : Promise.resolve(null);
  const midgroundTexturePromise = SCENE_CONFIG.assets.midground
    ? loadTexture(loader, SCENE_CONFIG.assets.midground)
    : Promise.resolve(null);
  const [backgroundTexture, midgroundTexture, terrainTexture, brokenTexture, intactTexture, fragmentTexture] = await Promise.all([
    loadTexture(loader, SCENE_CONFIG.assets.background),
    midgroundTexturePromise,
    loadTexture(loader, SCENE_CONFIG.assets.terrain),
    loadTexture(loader, SCENE_CONFIG.assets.subjectBroken),
    loadTexture(loader, SCENE_CONFIG.assets.subjectIntact),
    fragmentTexturePromise,
  ]);
  assertMatchingSubjectSize(brokenTexture, intactTexture);
  subjectTextures = { broken: brokenTexture, intact: intactTexture };
  subjectAlphaMasks = { broken: readAlphaMask(brokenTexture), intact: readAlphaMask(intactTexture) };

  for (const texture of [
    backgroundTexture,
    midgroundTexture,
    terrainTexture,
    brokenTexture,
    intactTexture,
    fragmentTexture,
  ]) {
    if (!texture) continue;
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

  const midgroundConfig = SCENE_CONFIG.layers.midground;
  let midground: THREE.Mesh | null = null;
  let midgroundMaterial: THREE.ShaderMaterial | null = null;
  if (midgroundConfig && midgroundTexture) {
    midgroundMaterial = createDistanceMaterial(midgroundTexture, {
      paperColor,
      nearDistance: midgroundConfig.dissolve[0],
      farDistance: midgroundConfig.dissolve[1],
      maxDissolve: midgroundConfig.dissolve[2],
      transparent: true,
      opacity: midgroundConfig.opacity,
    });
    midground = new THREE.Mesh(new THREE.PlaneGeometry(...midgroundConfig.size), midgroundMaterial);
    midground.position.set(...midgroundConfig.position);
    midground.renderOrder = 2;
    scene.add(midground);
  }

  const groundConfig = SCENE_CONFIG.layers.ground;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(...groundConfig.size), createGroundMaterial());
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(...groundConfig.position);
  scene.add(ground);

  scene.add(makeContactShadow());

  const subjectConfig = SCENE_CONFIG.layers.subject;
  const subjectGeometry = new THREE.PlaneGeometry(...subjectConfig.size);
  const brokenMaterial = createDistanceMaterial(brokenTexture, {
    paperColor,
    nearDistance: subjectConfig.dissolve[0],
    farDistance: subjectConfig.dissolve[1],
    maxDissolve: subjectConfig.dissolve[2],
    transparent: true,
  });
  subjectMaterial = brokenMaterial;
  subjectMesh = new THREE.Mesh(subjectGeometry, brokenMaterial);
  subjectMesh.position.set(...subjectConfig.position);
  subjectMesh.renderOrder = 5;
  scene.add(subjectMesh);

  hoverOutlineMaterial = createHoverOutlineMaterial(brokenTexture);
  const hoverOutline = new THREE.Mesh(subjectGeometry, hoverOutlineMaterial);
  hoverOutline.position.set(
    subjectConfig.position[0],
    subjectConfig.position[1],
    subjectConfig.position[2] + 0.02,
  );
  hoverOutline.renderOrder = 5.5;
  hoverOutline.visible = false;
  scene.add(hoverOutline);

  repairMaterial = createRepairMaterial(intactTexture, {
    damageCenter: subjectConfig.damageCenter,
    damageRadius: subjectConfig.damageRadius,
  });
  const restoredSubject = new THREE.Mesh(subjectGeometry, repairMaterial);
  restoredSubject.position.set(
    subjectConfig.position[0],
    subjectConfig.position[1],
    subjectConfig.position[2] + 0.04,
  );
  restoredSubject.renderOrder = 6;
  scene.add(restoredSubject);

  const particles = makeParticles();
  scene.add(particles);
  scene.add(makeRepairFragments(fragmentTexture, fragmentAtlas));

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

  const environmentMaterials = [backgroundMaterial, terrainMaterial];
  if (midgroundMaterial) environmentMaterials.push(midgroundMaterial);
  const backgroundBase = background.position.clone();
  const midgroundBase = midground?.position.clone();
  const terrainBase = terrain.position.clone();

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const paperPass = new ShaderPass(paperPassShader);
  paperPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  composer.addPass(paperPass);

  const cameraCurrent = new THREE.Vector3(...SCENE_CONFIG.camera.position);
  const cameraTarget = cameraCurrent.clone();

  function render(timestamp?: number) {
    if (!pageVisible) {
      requestAnimationFrame(render);
      return;
    }
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

    if (!reducedMotion) {
      background.position.x = backgroundBase.x + Math.sin(time * 0.2) * 0.025;
      if (midground && midgroundBase) {
        midground.position.x = midgroundBase.x + Math.sin(time * 0.29 + 0.7) * 0.09;
        midground.position.y = midgroundBase.y + Math.sin(time * 0.23 + 1.4) * 0.025;
      }
      terrain.position.x = terrainBase.x - Math.sin(time * 0.34 + 1.6) * 0.14;
      terrain.position.y = terrainBase.y + Math.sin(time * 0.27 + 0.4) * 0.035;
    }

    for (const material of environmentMaterials) {
      material.uniforms.uFocusDim.value = focusDim.value;
    }
    if (subjectMaterial && hoverOutlineMaterial) {
      const strength = THREE.MathUtils.lerp(
        hoverOutlineMaterial.uniforms.uStrength.value,
        hoverStrengthTarget,
        reducedMotion ? 1 : 0.09,
      );
      subjectMaterial.uniforms.uHover.value = strength;
      hoverOutlineMaterial.uniforms.uStrength.value = strength;
      hoverOutline.visible = strength > 0.001;
    }

    if (repairMaterial) repairMaterial.uniforms.uTime.value = time;
    if (particleMaterial) particleMaterial.uniforms.uTime.value = time;
    if (repairMaterial) {
      const progress = repairMaterial.uniforms.uProgress.value;
      particles.visible = progress > 0.012 && progress < 0.988;
      updateRepairFragments(progress, time);
    }
    paperPass.uniforms.uTime.value = time;

    composer.render();
    requestAnimationFrame(render);
  }

  window.addEventListener('pointermove', (event) => {
    pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;

    pointer.set(pointerTarget.x, pointerTarget.y);
    raycaster.setFromCamera(pointer, camera);
    const hovering = isSubjectHit();
    canvas.classList.toggle('is-interactive', hovering);
    hoverStrengthTarget = hovering
      ? restorationState === 'broken' ? 1 : restorationState === 'restored' ? 0.65 : 0
      : 0;
  });

  canvas.addEventListener('pointerleave', () => {
    hoverStrengthTarget = 0;
    canvas.classList.remove('is-interactive');
  });

  canvas.addEventListener('click', (event) => {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    if (isSubjectHit()) toggleRestoration();
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

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    gsap.globalTimeline.paused(!pageVisible);
  });

  restoreButton.addEventListener('click', toggleRestoration);
  setCopy('broken');
  render();

  loading.classList.add('is-hidden');
  window.setTimeout(() => loading.remove(), 850);
}

applySceneCopy();
init().catch((error: unknown) => {
  console.error('场景初始化失败：', error);
  const message = error instanceof Error ? error.message : '未知错误';
  fallback.querySelector('p')!.textContent = `场景加载失败：${message} 请检查素材后刷新页面。`;
  fallback.hidden = false;
  loading.remove();
});
