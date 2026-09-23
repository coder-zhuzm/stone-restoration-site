import { brickPagodaScene } from './scenes/brickPagoda';
import { pagodaScene } from './scenes/pagoda';
import { statueScene } from './scenes/statue';
import type { RestorationSceneConfig, SceneId } from './scenes/sceneTypes';

export type { RestorationSceneConfig, SceneId } from './scenes/sceneTypes';

export const SCENE_REGISTRY: Record<SceneId, RestorationSceneConfig> = {
  statue: statueScene,
  pagoda: pagodaScene,
  'brick-pagoda': brickPagodaScene,
};

const requestedScene = new URLSearchParams(window.location.search).get('scene');
export const ACTIVE_SCENE_ID: SceneId =
  requestedScene && Object.hasOwn(SCENE_REGISTRY, requestedScene)
    ? (requestedScene as SceneId)
    : 'statue';
export const SCENE_CONFIG = SCENE_REGISTRY[ACTIVE_SCENE_ID];
