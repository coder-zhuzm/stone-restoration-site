export type SceneId = 'statue' | 'pagoda' | 'brick-pagoda';

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
    midground?: string;
    terrain: string;
    subjectBroken: string;
    subjectIntact: string;
    fragments?: { path: string; columns: number; rows: number; count: number };
  };
  layers: {
    background: { size: Vec2; position: Vec3; dissolve: Vec3 };
    atmosphere: { size: Vec2; position: Vec3; opacity: number };
    midground?: { size: Vec2; position: Vec3; dissolve: Vec3; opacity: number };
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
