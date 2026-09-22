export type SceneId = 'statue' | 'pagoda';

type Vec2 = readonly [number, number];
type Vec3 = readonly [number, number, number];

export type RestorationSceneConfig = {
  id: SceneId;
  paperColor: string;
  copy: {
    documentTitle: string;
    ariaLabel: string;
    eyebrow: string;
    title: string;
    lead: string;
    chapter: string;
    brokenStatus: string;
    brokenAction: string;
    restoredStatus: string;
    restoredAction: string;
    phaseWake: string;
    phaseGather: string;
    phaseRepair: string;
    phaseSettle: string;
    directHint: string;
  };
  camera: {
    fov: 26;
    near: number;
    far: number;
    position: Vec3;
    lookAt: Vec3;
    scrollTravel: number;
    pointerTravel: Vec2;
    damping: number;
    restorationFocusTravel: number;
  };
  assets: {
    background: string;
    midground: string;
    terrain: string;
    subjectBroken: string;
    subjectIntact: string;
  };
  layers: {
    background: { size: Vec2; position: Vec3; dissolve: Vec3 };
    atmosphere: { size: Vec2; position: Vec3; opacity: number };
    midground: { size: Vec2; position: Vec3; dissolve: Vec3; opacity: number };
    ground: { size: Vec2; position: Vec3 };
    subject: {
      size: Vec2;
      position: Vec3;
      dissolve: Vec3;
      damageCenter: Vec2;
      damageRadius: Vec2;
      fragmentSpread: number;
      fragmentColors: readonly string[];
    };
    terrain: { size: Vec2; position: Vec3; dissolve: Vec3; opacity: number };
  };
  restoration: { forwardDuration: number; reverseDuration: number };
};

const shared = {
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

export const SCENE_REGISTRY: Record<SceneId, RestorationSceneConfig> = {
  statue: {
    id: 'statue',
    paperColor: shared.paperColor,
    copy: {
      documentTitle: '石上旧梦 · 残像复原',
      ariaLabel: '遗迹石像修复场景',
      eyebrow: '遗迹 · 修复试验',
      title: '石上旧梦',
      lead: '让风化的面容，从时间留下的裂隙中重新显现。',
      chapter: '壹 · 残像',
      brokenStatus: '石像仍沉睡在残缺之中',
      brokenAction: '触碰石像 · 开始修复',
      restoredStatus: '失落的面容已经复原',
      restoredAction: '再次触碰 · 回到残像',
      phaseWake: '缺损边缘正在苏醒',
      phaseGather: '散落石片正在聚合',
      phaseRepair: '失落的面容正在补全',
      phaseSettle: '修复正在收束',
      directHint: '也可以直接点击画面中的石像',
    },
    camera: shared.camera,
    assets: {
      ...shared.environmentAssets,
      subjectBroken: '/assets/statue-broken.png',
      subjectIntact: '/assets/statue-intact.png',
    },
    layers: {
      ...shared.environmentLayers,
      midground: {
        size: [7.2, 10.8],
        position: [-4.9, 1.7, -43],
        dissolve: [30, 105, 0.34],
        opacity: 0.78,
      },
      subject: {
        size: [14.6, 14.6],
        position: [4.6, 3.95, -20],
        dissolve: [20, 75, 0.08],
        damageCenter: [0.5, 0.735],
        damageRadius: [0.264, 0.285],
        fragmentSpread: 4.8,
        fragmentColors: ['#d5c29e', '#bda884', '#9d8a6e', '#e0d1b2'],
      },
      terrain: {
        size: [39, 13],
        position: [-2.5, -5.95, -11],
        dissolve: [8, 58, 0.045],
        opacity: 0.92,
      },
    },
    restoration: { forwardDuration: 2.45, reverseDuration: 1.35 },
  },
  pagoda: {
    id: 'pagoda',
    paperColor: shared.paperColor,
    copy: {
      documentTitle: '塔影重光 · 佛塔复原',
      ariaLabel: '遗迹佛塔修复场景',
      eyebrow: '古建 · 修复试验',
      title: '塔影重光',
      lead: '让断裂的塔刹与檐角，沿着砖石留下的纹理重新归位。',
      chapter: '贰 · 残塔',
      brokenStatus: '佛塔上层仍留有风化缺口',
      brokenAction: '触碰佛塔 · 开始修复',
      restoredStatus: '塔刹与檐角已经复原',
      restoredAction: '再次触碰 · 回到残塔',
      phaseWake: '断裂砖缝正在显现',
      phaseGather: '碎砖与瓦片正在聚合',
      phaseRepair: '塔刹与檐角正在补全',
      phaseSettle: '塔身结构正在稳定',
      directHint: '也可以直接点击画面中的佛塔',
    },
    camera: {
      ...shared.camera,
      lookAt: [0, 3.8, -35],
      restorationFocusTravel: 0.6,
    },
    assets: {
      background: '/assets/scenes/pagoda/background.png',
      midground: '/assets/scenes/pagoda/midground.png',
      terrain: '/assets/scenes/pagoda/foreground.png',
      subjectBroken: '/assets/scenes/pagoda/subject-broken.png',
      subjectIntact: '/assets/scenes/pagoda/subject-intact.png',
    },
    layers: {
      ...shared.environmentLayers,
      midground: {
        size: [34, 11.33],
        position: [-6, -0.35, -47],
        dissolve: [32, 108, 0.34],
        opacity: 0.72,
      },
      subject: {
        size: [10.4, 15.6],
        position: [4.5, 4.15, -20],
        dissolve: [20, 75, 0.08],
        damageCenter: [0.54, 0.82],
        damageRadius: [0.38, 0.31],
        fragmentSpread: 5.4,
        fragmentColors: ['#c56f4d', '#a55138', '#c8b79b', '#8f8170'],
      },
      terrain: {
        size: [41, 13.65],
        position: [-3.5, -6.25, -11],
        dissolve: [8, 58, 0.045],
        opacity: 0.94,
      },
    },
    restoration: { forwardDuration: 2.8, reverseDuration: 1.55 },
  },
};

const requestedScene = new URLSearchParams(window.location.search).get('scene');
export const ACTIVE_SCENE_ID: SceneId = requestedScene === 'pagoda' ? 'pagoda' : 'statue';
export const SCENE_CONFIG = SCENE_REGISTRY[ACTIVE_SCENE_ID];
