# 遗迹修复场景集

PC 端 Three.js 遗迹修复场景。当前包含石像与五层佛塔两个场景；点击残缺主体后，缺损区域以局部 Shader、石粉粒子、程序化碎片和状态动画逐步恢复。

## 本地运行

```bash
npm install
npm run dev
```

启动后可直接打开：

- 石像：`http://127.0.0.1:5173/?scene=statue`
- 佛塔：`http://127.0.0.1:5173/?scene=pagoda`

## 生产构建

```bash
npm run build
npm run preview
```

## 核心实现

- 26° 透视相机与真实 Z 轴分层。
- 配置驱动的 `sceneConfig.ts` 场景注册表；两个场景共用一套渲染器和动画循环。
- 透明中景佛塔与前景岩石地形带。
- 滚动推进、指针阻尼视差。
- 自定义距离溶解 Shader，不使用 `THREE.Fog`。
- 同源残缺态／完整态的局部补全 Shader，缺损中心和半径按场景配置。
- 16 块场景配色的程序化三维碎片与石粉共同完成可逆聚合动画。
- “唤醒、聚合、补全、收束”四阶段状态和按钮进度反馈。
- 固定在屏幕空间的程序化纸纹后处理。
- PC 专用布局，不包含移动端版本。

## 场景素材

- `public/assets/background-zhu2-graded.png`：两个场景首版共用的远景古城背景。
- `public/assets/midground-pagoda.png`：正立面透明中景塔。
- `public/assets/statue-broken.png`、`statue-intact.png`：石像残缺态与完整态。
- `public/assets/scenes/pagoda/subject-broken.png`、`subject-intact.png`：佛塔残缺态与完整态。
- `public/assets/scenes/pagoda/fragments.png`：佛塔碎砖瓦片图集；当前作为后续贴图碎片参考，首版动画仍使用程序化碎片。
- `public/assets/foreground-terrain.png`：两个场景首版共用的透明前景岩石地形带。

佛塔场景当前复用石像场景的远景与前景，只替换主修复对象、缺损范围、构图参数、碎片颜色和文案。后续如需形成完全独立的视觉章节，应再生成佛塔专属远景、中景和前景。

## 文档

- [`docs/multi-scene-handoff-guide.md`](docs/multi-scene-handoff-guide.md)：完整实现记录、多场景协议、Agent 交接提示词和新场景素材模板。
- [`docs/asset-generation-log.md`](docs/asset-generation-log.md)：所有生成图片的最终提示词、尺寸、用途、验收与接入状态。
