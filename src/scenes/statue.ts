import { shared } from './shared';
import type { RestorationSceneConfig } from './sceneTypes';

export const statueScene: RestorationSceneConfig = {
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
};
