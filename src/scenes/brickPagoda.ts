import { shared } from './shared';
import type { RestorationSceneConfig } from './sceneTypes';

export const brickPagodaScene: RestorationSceneConfig = {
  id: 'brick-pagoda',
  paperColor: shared.paperColor,
  copy: {
    documentTitle: '檐影归序 · 密檐塔复原',
    ariaLabel: '密檐砖塔修复场景',
    eyebrow: '古塔 · 修复试验',
    title: '檐影归序',
    lead: '让断裂的密檐与塔刹，在风化砖缝之间重新衔接。',
    chapter: '叁 · 残檐',
    brokenStatus: '密檐塔上部仍留有断裂缺口',
    brokenAction: '触碰密檐塔 · 开始修复',
    restoredStatus: '十一层密檐已经重新连贯',
    restoredAction: '再次触碰 · 回到残塔',
    phaseWake: '塔顶裂缝正在显现',
    phaseGather: '断砖与檐瓦正在聚合',
    phaseRepair: '上部密檐正在补全',
    phaseSettle: '塔刹结构正在稳定',
    directHint: '也可以直接点击画面中的密檐塔',
  },
  camera: {
    ...shared.camera,
    lookAt: [0, 4.15, -35],
    restorationFocusTravel: 0.58,
  },
  assets: {
    background: '/assets/scenes/brick-pagoda/background.png',
    midground: '/assets/scenes/brick-pagoda/midground.png',
    terrain: '/assets/scenes/brick-pagoda/foreground.png',
    subjectBroken: '/assets/scenes/brick-pagoda/subject-broken.png',
    subjectIntact: '/assets/scenes/brick-pagoda/subject-intact.png',
  },
  layers: {
    ...shared.environmentLayers,
    midground: {
      size: [35, 11.31],
      position: [-7, -0.25, -47],
      dissolve: [32, 108, 0.35],
      opacity: 0.7,
    },
    subject: {
      size: [9.2, 13.8],
      position: [4.55, 3.65, -20],
      dissolve: [20, 75, 0.08],
      damageCenter: [0.55, 0.84],
      damageRadius: [0.38, 0.3],
      fragmentSpread: 5.2,
      fragmentColors: ['#c97145', '#a95737', '#d0b792', '#847a6a'],
    },
    terrain: {
      size: [41, 13.65],
      position: [-3.5, -6.25, -11],
      dissolve: [8, 58, 0.045],
      opacity: 0.94,
    },
  },
  restoration: { forwardDuration: 2.95, reverseDuration: 1.6 },
};
