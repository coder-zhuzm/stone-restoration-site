import * as THREE from 'three';

const noiseGLSL = `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
`;

export function createDistanceMaterial(
  texture: THREE.Texture,
  options: {
    paperColor: THREE.Color;
    nearDistance: number;
    farDistance: number;
    maxDissolve: number;
    transparent?: boolean;
  },
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uPaperColor: { value: options.paperColor },
      uNear: { value: options.nearDistance },
      uFar: { value: options.farDistance },
      uMaxDissolve: { value: options.maxDissolve },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vDistance;

      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vDistance = distance(worldPosition.xyz, cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uPaperColor;
      uniform float uNear;
      uniform float uFar;
      uniform float uMaxDissolve;
      varying vec2 vUv;
      varying float vDistance;

      void main() {
        vec4 texel = texture2D(uMap, vUv);
        if (texel.a < 0.025) discard;
        float dissolve = smoothstep(uNear, uFar, vDistance) * uMaxDissolve;
        vec3 color = mix(texel.rgb, uPaperColor, dissolve);
        gl_FragColor = vec4(color, texel.a);
      }
    `,
    transparent: options.transparent ?? false,
    depthWrite: !(options.transparent ?? false),
    alphaTest: options.transparent ? 0.025 : 0,
    toneMapped: false,
  });
}

export function createRepairMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uProgress: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uProgress;
      uniform float uTime;
      varying vec2 vUv;
      ${noiseGLSL}

      void main() {
        vec4 texel = texture2D(uMap, vUv);
        if (texel.a < 0.025) discard;

        vec2 centered = vec2((vUv.x - 0.5) * 1.08, vUv.y - 0.735);
        float radial = length(centered);
        float region = 1.0 - smoothstep(0.19, 0.285, radial);
        float organic = valueNoise(vUv * 12.0 + vec2(uTime * 0.025, 0.0));
        float frontier = uProgress * 0.38;
        float reveal = 1.0 - smoothstep(frontier - 0.035, frontier + 0.025, radial + (organic - 0.5) * 0.035);
        reveal *= region;

        float edge = smoothstep(0.018, 0.0, abs(radial - frontier + (organic - 0.5) * 0.035));
        edge *= region * step(0.015, uProgress) * step(uProgress, 0.985);
        vec3 warmStone = vec3(0.76, 0.61, 0.38);
        vec3 color = mix(texel.rgb, warmStone, edge * 0.28);

        gl_FragColor = vec4(color, texel.a * reveal);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    alphaTest: 0.025,
    toneMapped: false,
  });
}

export function createGroundMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uNearColor: { value: new THREE.Color('#d7c7a8') },
      uFarColor: { value: new THREE.Color('#eee4cf') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uNearColor;
      uniform vec3 uFarColor;
      varying vec2 vUv;
      ${noiseGLSL}

      void main() {
        float grain = valueNoise(vUv * vec2(28.0, 70.0));
        vec3 color = mix(uNearColor, uFarColor, smoothstep(0.08, 0.88, vUv.y));
        color += (grain - 0.5) * 0.035;
        float sideFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        float farFade = 1.0 - smoothstep(0.76, 1.0, vUv.y);
        gl_FragColor = vec4(color, 0.92 * sideFade * farFade);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

export const paperPassShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float hashScreen(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec2 pixel = floor(gl_FragCoord.xy * 0.62);
      float grain = hashScreen(pixel + floor(uTime * 2.0) * 0.01) - 0.5;
      float fiber = sin(gl_FragCoord.y * 0.47 + hashScreen(vec2(pixel.y, 4.0)) * 3.0) * 0.5;
      float vignette = smoothstep(0.82, 0.24, distance(vUv, vec2(0.5)));
      vec3 color = base.rgb + grain * 0.018 + fiber * 0.004;
      color *= mix(0.965, 1.0, vignette);
      gl_FragColor = vec4(color, base.a);
    }
  `,
};
