export const shared = {
  paperColor: '#eee6d2',
  camera: {
    fov: 26 as const,
    near: 0.1,
    far: 300,
    position: [0, 3.1, 18] as const,
    lookAt: [0, 3.05, -35] as const,
    scrollTravel: 5.4,
    pointerTravel: [0.88, 0.32] as const,
    damping: 0.045,
    restorationFocusTravel: 0.72,
  },
  environmentAssets: {
    background: '/assets/background-zhu2-graded.png',
    midground: '/assets/midground-pagoda.png',
    terrain: '/assets/foreground-terrain.png',
  },
  environmentLayers: {
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
    ground: {
      size: [145, 155] as const,
      position: [0, -3.5, -52] as const,
    },
  },
};
