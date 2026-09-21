export const SCENE_CONFIG = {
  paperColor: '#eee6d2',
  camera: {
    fov: 26,
    near: 0.1,
    far: 300,
    position: [0, 3.1, 18] as const,
    lookAt: [0, 3.05, -35] as const,
    scrollTravel: 5.4,
    pointerTravel: [0.88, 0.32] as const,
    damping: 0.045,
    restorationFocusTravel: 0.72,
  },
  assets: {
    background: '/assets/background-zhu2-graded.png',
    pagoda: '/assets/midground-pagoda.png',
    terrain: '/assets/foreground-terrain.png',
    statueBroken: '/assets/statue-broken.png',
    statueIntact: '/assets/statue-intact.png',
  },
  layers: {
    background: {
      size: [102, 57.38] as const,
      position: [-1.5, 8.8, -100] as const,
      dissolve: [45, 145, 0.2] as const,
    },
    atmosphere: {
      size: [105, 60] as const,
      position: [0, 7, -55] as const,
      opacity: 0.055,
    },
    pagoda: {
      size: [7.2, 10.8] as const,
      position: [-4.9, 1.7, -43] as const,
      dissolve: [30, 105, 0.34] as const,
      opacity: 0.78,
    },
    ground: {
      size: [145, 155] as const,
      position: [0, -3.5, -52] as const,
    },
    statue: {
      size: [14.6, 14.6] as const,
      position: [4.6, 3.95, -20] as const,
      dissolve: [20, 75, 0.08] as const,
    },
    terrain: {
      size: [39, 13] as const,
      position: [-2.5, -5.95, -11] as const,
      dissolve: [8, 58, 0.045] as const,
      opacity: 0.92,
    },
  },
  restoration: {
    forwardDuration: 2.45,
    reverseDuration: 1.35,
  },
} as const;
