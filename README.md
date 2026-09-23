# 遗迹修复场景集

PC 端 Three.js 遗迹修复场景。当前包含石像、五层楼阁式佛塔和十一层密檐砖塔三个场景；点击残缺主体后，缺损区域以局部 Shader、石粉粒子、碎片和状态动画逐步恢复。

## 本地运行

```bash
npm install
npm run dev
```

启动后可直接打开：

- 石像：`http://127.0.0.1:5173/?scene=statue`
- 佛塔：`http://127.0.0.1:5173/?scene=pagoda`
- 密檐塔：`http://127.0.0.1:5173/?scene=brick-pagoda`

## 生产构建

```bash
npm run build
npm run preview
```

## 核心实现

- 26° 透视相机与真实 Z 轴分层。
- `sceneConfig.ts` 负责场景注册，`src/scenes/` 分别保存三个场景参数；三个场景共用一套渲染器和动画循环。
- 石像场景由古城远景、主石像和前景岩石地形带构图，不再叠加独立小塔；另两座塔保留各自的中景。
- 滚动推进、指针阻尼视差。
- 远景、中景与前景以不同幅度进行低频自动呼吸。
- 自定义距离溶解 Shader，不使用 `THREE.Fog`。
- 静止的残缺态和完整态不显示漂浮石粉；石粉与碎片仅在修复／回退动画中出现。
- 主体悬停时以贴图 Alpha 生成低强度暖色轮廓反馈；点击命中也按可见像素判断。
- 同源残缺态／完整态的局部补全 Shader，缺损中心和半径按场景配置。
- 石像和密檐塔使用 16 块场景配色的程序化三维碎片；佛塔使用八块贴图碎片，均与石粉共同完成可逆聚合动画。
- 修复聚焦阶段相机轻推并将环境压暗约 8%，完成后恢复。
- “唤醒、聚合、补全、收束”四阶段状态和按钮进度反馈。
- 完成态显示“残缺并未消失，只是等待被看见。”结果文案。
- 固定在屏幕空间的程序化纸纹后处理。
- 页面进入后台时暂停非必要渲染和 GSAP 时间轴；WebGL 失败时以当前场景远景作为静态降级背景。
- 素材加载前校验缺损参数和碎片图集配置，并检查主物件双状态尺寸一致。
- PC 专用布局，不包含移动端版本。

## 场景素材

- `public/assets/background-zhu2-graded.png`：石像场景远景古城背景。
- `public/assets/midground-pagoda.png`：此前用于石像场景的正立面小塔；目前留档，不加载到任何场景。
- `public/assets/statue-broken.png`、`statue-intact.png`：石像残缺态与完整态。
- `public/assets/scenes/pagoda/subject-broken.png`、`subject-intact.png`：佛塔残缺态与完整态。
- `public/assets/scenes/pagoda/background.png`：佛塔专属山谷与寺院遗址远景。
- `public/assets/scenes/pagoda/midground.png`：佛塔专属透明寺院残墙中景。
- `public/assets/scenes/pagoda/foreground.png`：佛塔专属透明砖瓦遗址前景。
- `public/assets/scenes/pagoda/fragments.png`：`2×4` 佛塔碎砖瓦片图集；修复动画按 UV 切成八块透明贴图碎片。
- `public/assets/foreground-terrain.png`：石像场景透明前景岩石地形带。
- `public/assets/scenes/brick-pagoda/`：密檐砖塔的完整态、残缺态、荒原远景、石窟中景和砖石前景。

三个场景均拥有独立的主修复对象和场景参数；两座佛塔还拥有各自的远景、中景与前景。所有场景只复用公共渲染与交互能力。

## 文档

- [`docs/multi-scene-handoff-guide.md`](docs/multi-scene-handoff-guide.md)：完整实现记录、多场景协议、Agent 交接提示词和新场景素材模板。
- [`docs/asset-generation-log.md`](docs/asset-generation-log.md)：所有生成图片的最终提示词、尺寸、用途、验收与接入状态。
