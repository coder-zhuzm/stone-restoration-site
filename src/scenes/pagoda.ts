import { shared } from './shared';
import type { RestorationSceneConfig } from './sceneTypes';

export const pagodaScene: RestorationSceneConfig = {
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
    fragments: {
      path: '/assets/scenes/pagoda/fragments.png',
      columns: 2,
      rows: 4,
      count: 8,
    },
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
};
