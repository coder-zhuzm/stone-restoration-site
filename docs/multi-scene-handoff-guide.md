# 石上旧梦 · 多场景复用与 Agent 交接指南

> 状态：当前已实现的三个**独立**场景与交接协议。滚动游历的单一连续世界尚未实现，其设计边界见 [连续世界方案](continuous-world-plan.md)；跨主题改图方法见 [素材生产指南](asset-production-guide.md)。

## 1. 文档用途

本文档记录石像、五层楼阁式佛塔和十一层密檐砖塔三个修复场景的真实实现过程，并定义后续新增其他佛塔、石砖、石碑、造像和建筑构件修复场景时必须遵守的素材协议、代码结构、生成提示词、验收方式与交接格式。

本文档可以直接交给：

- 继续开发本项目的代码 Agent。
- 负责生成或编辑素材的图像模型。
- 负责审核素材一致性的视觉 Agent。
- 需要复刻同类 2.5D 修复场景的其他团队。

本文档描述的是可执行约束，不包含沟通过程或讨论性表达。

## 2. 当前结论

### 2.1 当前完成范围

当前工程已完成三个 PC 端修复场景的代码接入：

1. `zhu2` 古城远景。
2. 石像场景使用古城远景和前景岩带，不叠加独立小塔。
3. 残缺／完整双状态主石像。
4. 前景岩石地形带。
5. 26° 透视相机和真实 Z 轴分层。
6. 滚动推进、指针阻尼视差、距离溶解和屏幕空间纸纹。
7. 石像局部补全 Shader、石粉粒子、16 块程序化三维石片和四阶段修复状态。
8. 五层佛塔残缺／完整双状态、上部缺损范围、佛塔配色碎片和独立修复文案。
9. `?scene=statue`、`?scene=pagoda` 与 `?scene=brick-pagoda` 场景切换入口。
10. 三个场景共用一套渲染器、相机、状态机、Shader、粒子和动画循环。
11. 佛塔章节拥有独立的山谷远景、寺院残墙中景与砖瓦前景。
12. 佛塔使用 `2×4` 图集生成八块贴图碎片，石像保留程序化三维石片。
13. 密檐砖塔拥有同源双状态、黄土荒原远景、石窟崖壁中景和砖石前景，使用程序化砖石碎片。
14. 三个场景共用低频环境呼吸、基于主物件 Alpha 的悬停暖色轮廓与像素级点击命中、聚焦压暗和结果文案；静止状态不显示漂浮物，石粉与碎片仅在修复／回退时出现。
15. 页面进入后台时停止非必要帧渲染并暂停 GSAP 时间轴，WebGL 失败时显示当前场景远景作为静态降级画面。
16. 三个场景的配置已拆分成独立模块；加载时校验缺损参数、图集行列数量和主物件双状态尺寸。

“已完成”只表示素材已经接入且生产构建通过，不代表浏览器视觉验收已经通过；最终画面由用户自行预览确认。

### 2.2 当前素材是否足够支持多个场景

已足够支撑三个视觉上独立且可运行的修复场景。

现有素材能够支撑石像、五层楼阁式佛塔和十一层密檐砖塔三个主修复对象，两座塔均具备同源完整态、残缺态和专属环境素材。

三个场景拥有各自的主物件、缺损范围、构图参数、碎片配色和文案；两座塔还拥有专属环境素材。新增第四个主物件时，仍必须先补齐同源完整态、残缺态和至少一套能建立自身场景语义的环境素材。

### 2.3 可复用边界

- 同类独立场景可复用渲染、相机、Shader、粒子、纸纹和修复状态机；仍需新素材与逐场景调参。
- 换成其他古迹主题时，历史形制、材料损坏方式、画风锚点和环境叙事必须重做，不能只替换提示词中的名词。
- 主修复对象素材不能直接代表不同古迹；环境素材只有在同一世界观、地貌与画风相容时才可复用。
- 连续世界需要多站点状态与相机路径重构，不适用“新增一份独立场景配置即可完成”的流程。此前的复用百分比没有实测依据，不作为工作量承诺。

## 3. 已确定的项目决策

1. 不使用 `zhu1.png`。
2. `zhu2` 是石像场景唯一完整远景，不拆分内部建筑和人物。
3. 只实现 PC 版，不维护移动端布局和竖屏素材。
4. 使用 Vite、TypeScript、Three.js 和 GSAP。
5. 相机 FOV 保持在约 `26°`。
6. 不使用 `THREE.Fog`；距离融合由 Shader 将颜色溶向纸色。
7. 纸纹固定在屏幕空间。
8. 主物件的残缺态必须从完整母版编辑得到。
9. 不分别生成两张“相似”的完整／残缺图片。
10. 不建立 Python 抠图或自动图片元数据管线。
11. 图片由生成式图像模型直接输出最终透明素材，场景参数在 TypeScript 中人工调节。
12. 原始素材不覆盖；每次生成使用新文件名并进入素材台账。

## 4. 实现记录

### 4.1 Git 里程碑

| 提交 | 内容 |
|---|---|
| `bec6064` | 建立 PC 石像修复场景、核心素材、26° 相机、Shader、纸纹和基础交互 |
| `868d504` | 增加中景古塔、前景岩带和集中场景配置 |
| `f880b07` | 使用 `THREE.Timer` 替换弃用的 `THREE.Clock` |
| `297a899` | 增加四阶段修复反馈、按钮进度和 16 块可逆三维石片 |
| `886d211` | 建立多场景交接指南和生成素材台账 |
| `d227bc2` | 生成五层佛塔三项主体素材，参数化缺损区域，建立石像／佛塔场景注册表并接入第二场景 |
| `c21bff1` | 生成并接入佛塔专属远景、中景和前景，使两个场景形成独立美术章节 |
| `daeb421` | 将佛塔 `2×4` 碎片图集切成八个透明面片并接入可逆修复动画 |
| `2c24bd6` | 生成并接入十一层密檐砖塔及其黄土荒原、石窟中景和砖石前景，完成第三场景 |
| `aaba2eb` | 补齐低频环境呼吸、残缺态尘埃、悬停暖光、修复聚焦压暗、结果文案和后台暂停 |
| `06a3512` | 拆分三个独立场景配置；加入 Alpha 轮廓与像素级点击命中、GSAP 后台暂停、素材配置校验 |
| `8c56018` | 静止状态隐藏石粉与碎片，石像场景移除独立小塔并保留素材留档 |

### 4.2 当前核心文件

| 文件 | 责任 |
|---|---|
| `src/main.ts` | 场景初始化、贴图加载、相机、滚动、指针、修复状态机、粒子和石片 |
| `src/sceneConfig.ts` | 场景注册表与 URL 入口选择 |
| `src/scenes/sceneTypes.ts` | 场景配置的 TypeScript 协议 |
| `src/scenes/shared.ts` | 相机、纸色及环境层的共用默认参数 |
| `src/scenes/statue.ts`、`pagoda.ts`、`brickPagoda.ts` | 三个场景各自的素材路径、位置、尺寸、深度、缺损与文案参数 |
| `src/shaders.ts` | 距离溶解、局部修复、悬停轮廓、地面和屏幕空间纸纹 Shader |
| `src/style.css` | PC UI、修复进度、完成标记、加载层和可访问状态 |
| `index.html` | 场景 Canvas 与 UI 语义结构 |
| `public/assets/` | 页面实际消费的最终素材 |
| `docs/asset-generation-log.md` | 所有生成图片的提示词、尺寸、用途和验收记录 |

## 5. 当前素材清单

| 文件 | 尺寸 | Alpha | 场景 | 类型 | 复用策略 |
|---|---:|---|---|---|---|
| `background-zhu2-graded.png` | `1672×941` | 否 | 石像 | 完整远景 | 可作为同一世界公共背景，避免在所有场景重复使用 |
| `midground-pagoda.png` | `1024×1536` | 是 | 留档 | 曾用的中景小塔 | 当前不加载；不作为修复主物件 |
| `foreground-terrain.png` | `2172×724` | 是 | 石像 | 前景地形 | 可裁切、镜像、改变尺度后复用 |
| `statue-broken.png` | `1254×1254` | 是 | 石像 | 主物件残缺态 | 当前场景专用 |
| `statue-intact.png` | `1254×1254` | 是 | 石像 | 主物件完整态 | 当前场景专用 |
| `scenes/pagoda/subject-broken.png` | `1024×1536` | 是 | 佛塔 | 主物件残缺态 | 佛塔场景专用 |
| `scenes/pagoda/subject-intact.png` | `1024×1536` | 是 | 佛塔 | 主物件完整态 | 佛塔场景专用 |
| `scenes/pagoda/fragments.png` | `1246×1262` | 是 | 佛塔 | `2×4` 碎片图集 | 已按 UV 切片进入修复动画 |
| `scenes/pagoda/background.png` | `1672×941` | 否 | 佛塔 | 完整远景 | 佛塔场景专用 |
| `scenes/pagoda/midground.png` | `2172×724` | 是 | 佛塔 | 中景残墙 | 佛塔场景专用 |
| `scenes/pagoda/foreground.png` | `2172×724` | 是 | 佛塔 | 前景砖瓦带 | 佛塔场景专用 |
| `scenes/brick-pagoda/subject-broken.png` | `1024×1536` | 是 | 密檐塔 | 主物件残缺态 | 密檐塔场景专用 |
| `scenes/brick-pagoda/subject-intact.png` | `1024×1536` | 是 | 密檐塔 | 主物件完整态 | 密檐塔场景专用 |
| `scenes/brick-pagoda/background.png` | `1672×941` | 否 | 密檐塔 | 黄土荒原远景 | 密檐塔场景专用 |
| `scenes/brick-pagoda/midground.png` | `2206×713` | 是 | 密檐塔 | 石窟崖壁中景 | 密檐塔场景专用 |
| `scenes/brick-pagoda/foreground.png` | `2172×724` | 是 | 密檐塔 | 砖石前景带 | 密檐塔场景专用 |

## 6. 公共能力与场景专用能力

### 6.1 公共能力

后续场景应直接复用：

- WebGL Renderer 和 EffectComposer。
- 26° PerspectiveCamera。
- 滚动推进和指针阻尼。
- 距离溶解 Shader。
- 屏幕空间纸纹。
- 不同深度图层的低频自动呼吸。
- 静止状态无漂浮物；修复／回退阶段的石粉与碎片，以及主体悬停暖光。
- 修复聚焦时环境压暗约 8%，完成后恢复。
- 加载状态和 WebGL 降级提示。
- 修复状态机：`broken → restoring → restored → reversing → broken`。
- GSAP 时间轴。
- 石粉粒子和程序化三维碎片。
- 按钮进度、`aria-busy`、`aria-pressed` 和键盘操作。
- Git、构建和文档流程。

### 6.2 场景专用能力

每个场景必须独立定义：

- 场景标题、章节名、引导文案和完成文案。
- 远景背景。
- 主物件完整态与残缺态。
- 缺损中心、缺损半径和补全方向。
- 碎片材质、数量、运动范围和颜色。
- 主物件位置、尺寸、接地点和相机观察点。
- 中景、地面和前景素材。
- 修复时间和完成后的视觉反馈。

## 7. 当前多场景目录

```text
stone-restoration-site/
├── docs/
│   ├── multi-scene-handoff-guide.md
│   └── asset-generation-log.md
├── public/
│   └── assets/
│       ├── background-zhu2-graded.png
│       ├── statue-broken.png / statue-intact.png
│       ├── midground-pagoda.png         # 留档，当前不加载
│       ├── foreground-terrain.png
│       └── scenes/
│           ├── pagoda/                   # 佛塔双状态、环境和碎片图集
│           └── brick-pagoda/             # 密檐塔双状态和环境
└── src/
    ├── scenes/
    │   ├── sceneTypes.ts
    │   ├── shared.ts
    │   ├── statue.ts
    │   ├── pagoda.ts
    │   └── brickPagoda.ts
    ├── sceneConfig.ts                 # 注册表与场景选择
    ├── shaders.ts
    ├── main.ts
    └── style.css
```

当前版本保留一套公共渲染与动画循环，并将配置协议、共享默认值、场景实例和注册表分离。新增场景只需在 `src/scenes/` 添加一个配置文件，并在类型与注册表中登记；不复制 `src/main.ts`。

## 8. 场景配置协议

其他 Agent 新增场景时，应直接实现 `src/scenes/sceneTypes.ts` 中的 `RestorationSceneConfig`，不要另建一套接口。关键配置关系如下；完整字段以代码中的类型为准：

```ts
const newScene: RestorationSceneConfig = {
  id: 'new-scene', // 同时加入 SceneId 和 SCENE_REGISTRY
  paperColor: '#...',
  copy: { /* 页面文案及四阶段状态文案 */ },
  camera: { fov: 26, /* 位置、观察点、滚动与指针幅度 */ },
  assets: {
    background: '/assets/scenes/new-scene/background.png',
    midground: '/assets/scenes/new-scene/midground.png',
    terrain: '/assets/scenes/new-scene/foreground.png',
    subjectBroken: '/assets/scenes/new-scene/subject-broken.png',
    subjectIntact: '/assets/scenes/new-scene/subject-intact.png',
    // fragments: { path: '/assets/scenes/new-scene/fragments.png', columns: 2, rows: 4, count: 8 },
  },
  layers: {
    background: { /* size, position, dissolve */ },
    atmosphere: { /* size, position, opacity */ },
    midground: { /* size, position, dissolve, opacity */ },
    ground: { /* size, position */ },
    subject: { /* size, position, dissolve, damageCenter, damageRadius, fragmentSpread, fragmentColors */ },
    terrain: { /* size, position, dissolve, opacity */ },
  },
  restoration: { forwardDuration: 3.7, reverseDuration: 2.2 },
};
```

禁止在新场景文件中复制一整份渲染器和动画循环。公共引擎只初始化一次，场景通过配置切换。

## 9. 推荐场景序列

| 顺序 | 场景 | 主物件 | 修复形式 | 新素材优先级 |
|---:|---|---|---|---|
| 1 | 石像修复 | 坐姿石像 | 面部与冠饰补全 | 已完成 |
| 2 | 佛塔修复 | 五层楼阁式佛塔 | 塔刹、檐角、砖墙补全 | 已完成 |
| 3 | 密檐塔修复 | 十一层密檐砖塔 | 塔刹、上部三层密檐补全 | 已完成 |
| 4 | 石砖修复 | 残损城墙／经砖 | 缺砖归位与裂缝闭合 | 高 |
| 5 | 石碑修复 | 断裂碑身 | 断口拼合与刻纹显现 | 中 |
| 6 | 浮雕修复 | 佛教浅浮雕 | 局部轮廓和纹样补全 | 中 |

## 10. 每个新场景的最小素材包

### 10.1 必需素材

1. `subject-intact.png`：完整母版，透明背景。
2. `subject-broken.png`：从完整母版局部编辑得到，透明背景。
3. `background.png`：完整远景，允许不透明。
4. `foreground.png`：横向透明地形或遮挡带。

### 10.2 推荐素材

1. `midground.png`：一件或一条中景构件。
2. `fragments.png`：需要特定纹理时使用的碎片图集。
3. `damage-mask.png`：白色为修复区、黑色为保留区；仅当目标工具支持稳定遮罩时使用。

### 10.3 硬标准

- 一张透明素材只包含一个主体或一条连续地形带。
- 建筑和有明确朝向的物件必须严格正立面。
- 不得包含水印、文字、地面、投影、人物或无关物件。
- 完整态与残缺态必须保持画布、位置、比例、透视和光线一致。
- 背景透明区域必须是真实 Alpha，不得用黑底、白底或棋盘格伪装。
- 风格必须属于同一套旧纸水彩与细铅笔线体系。

以上最后一项是**当前项目**的风格约束。换主题时应先重写共用风格卡，仍须保证一个世界内部统一；具体方法见素材生产指南。

## 11. 生图提示词模板

以下模板面向当前佛塔画风，是历史素材的延展起点，不可原样用于其他文化或材料的古迹。跨主题和连续环境的提示词骨架见 [素材生产指南](asset-production-guide.md)。实际采用的逐张提示词以 [素材台账](asset-generation-log.md) 为准。

### 11.1 通用风格锚点

```text
Style anchor: warm aged-paper watercolor washes combined with delicate graphite and fine pencil outlines. Muted bone white, limestone gray, pale sage, restrained mineral red and warm ochre. Soft diffuse daylight, low contrast, subtle archaeological weathering. No photorealism, no thick black outlines, no saturated colors, no cinematic glow.
```

### 11.2 佛塔完整母版

```text
Use case: historical-scene.
Asset type: transparent primary restoration subject for a desktop Three.js 2.5D heritage scene.
Primary request: create one complete ancient Chinese Buddhist brick-and-stone pagoda, strictly front-facing, vertically upright and symmetrical. Show the entire foundation, tower body, every eave, roof ridge and finial without cropping.
Style/medium: [粘贴通用风格锚点].
Composition: orthographic or very long-lens frontal view; centered on one fixed canvas with generous transparent margin.
Materials: weathered pale sandstone, faded brick red, gray roof tiles, subtle cracks and age stains while remaining structurally complete.
Constraints: genuinely transparent background; only one pagoda; no ground, horizon, cast shadow, trees, mountains, walls, people, animals, text, seal, logo, watermark or border.
Avoid: 45-degree perspective, side view, wide-angle distortion, missing eaves, asymmetrical roof tiers, black background, paper rectangle.
```

### 11.3 佛塔残缺态局部编辑

```text
Use case: precise-object-edit.
Asset type: damaged starting state paired with the supplied intact pagoda.
Input image: the supplied intact pagoda is the sole geometry, composition and style source.
Primary request: damage only the upper finial, one controlled section of the upper eave and a limited patch of the tower body. Create authentic missing masonry, chipped roof tiles, fractured brick edges and exposed rough stone.
Invariants: preserve the exact canvas, position, scale, frontal projection, foundation, all undamaged tiers, doors, windows, roof lines, colors, lighting and transparent background.
Constraints: no global redraw, no new architecture, no perspective change, no floating debris, no ground, no cast shadow, no text, no watermark.
Avoid: mosaic blocks, blur, censor-like damage, perfectly rectangular holes, fire damage, collapse of the entire building.
```

### 11.4 佛塔碎砖与瓦片

```text
Use case: stylized-concept.
Asset type: transparent restoration fragments.
Primary request: create one compact set of 6–10 individual weathered brick, roof-tile and pale stone fragments matching the supplied intact pagoda.
Composition: pieces separated from each other with clear transparent gaps; front or near-front views; no overlap.
Style/medium: [粘贴通用风格锚点].
Constraints: genuinely transparent background; no ground, cast shadow, dust cloud, text, watermark or unrelated objects.
```

### 11.5 新场景远景

```text
Use case: historical-scene.
Asset type: wide desktop far-background plate for a Three.js 2.5D heritage scene.
Primary request: create a calm historical Chinese Buddhist architectural environment with distant mountains, low city walls, courtyards and waterways. Leave a clear visual opening for the primary restoration subject.
Style/medium: [粘贴通用风格锚点].
Composition: wide 16:9 landscape; low-detail distance; generous pale sky; principal background landmark placed away from the future subject position.
Constraints: no dominant foreground object, no text, watermark, logo, border or modern elements.
```

## 12. 图像生成执行顺序

1. 先生成完整主物件母版。
2. 人工确认正立面、轮廓、比例、风格和透明通道。
3. 将完整母版作为唯一输入，局部生成残缺态。
4. 叠加检查未损坏区域是否跳位。
5. 生成配套碎片。
6. 生成或选择远景、中景和前景。
7. 将所有输出登记到 `docs/asset-generation-log.md`。
8. 素材验收通过后才进入代码。

## 13. 代码 Agent 交接提示词

以下提示词只适用于在现有**独立场景**架构里再加一个站点。若任务是同一世界内滚动经过多个古迹，应先按 [连续世界方案](continuous-world-plan.md) 设计和验证两站原型，不直接套用本节。

将以下内容与本文档一起交给新的开发 Agent：

```text
请在现有 stone-restoration-site 工程中新增一个配置驱动的修复场景，不要复制渲染器或动画循环。先阅读 docs/multi-scene-handoff-guide.md、docs/asset-generation-log.md、src/main.ts、src/sceneConfig.ts、src/scenes/sceneTypes.ts、src/scenes/shared.ts 和 src/shaders.ts。

保持以下约束：PC only；Three.js + TypeScript + GSAP；26° FOV；不使用 THREE.Fog；纸纹固定在屏幕空间；完整态与残缺态使用完全相同的 PlaneGeometry、位置和缩放；修复只影响配置指定的缺损区域；所有透明面片 depthWrite=false；不得修改现有石像场景的视觉参数。

使用现有 RestorationSceneConfig 协议，在 src/scenes/ 中新增独立场景配置，并在 SceneId 类型和 src/sceneConfig.ts 注册表登记。图集碎片若有，必须填写 path、columns、rows、count，且数量与网格容量一致。加载前确认双状态图片尺寸相同。运行 npm run build 并提交可回滚的 Git 版本。不要实施移动端，不要部署，不要覆盖原始图片。
```

## 14. 生图 Agent 交接提示词

```text
你负责为一个 Three.js 2.5D 文物修复场景制作最终透明素材。先阅读交接文档中的素材硬标准和对应场景提示词。必须先生成完整母版，确认后才能从该母版局部编辑残缺态。完整态和残缺态不得分别独立生成。

每次只生成一个资产。输出后记录：文件名、用途、输入参考、最终提示词、模型、生成日期、尺寸、透明通道、验收结论和失败原因。禁止水印、文字、地面、投影、45 度视角和伪透明背景。未经确认的素材不得进入前端工程。
```

## 15. 新场景接入步骤

1. 为场景建立独立素材目录。
2. 完成素材台账和硬标准检查。
3. 新建场景定义，不修改公共 Shader 默认值。
4. 参数化缺损中心和半径。
5. 先只加载背景和主物件，检查构图。
6. 加入中景、地面和前景。
7. 加入石粉与碎片。
8. 设置场景文案和完成态。
9. 执行 TypeScript 和生产构建。
10. 由用户在浏览器中完成视觉验收。
11. 根据用户反馈调整场景配置。
12. 提交 Git，并更新素材台账和实现记录。

## 16. 验收清单

### 16.1 素材

- [ ] 完整态与残缺态来自同一母版。
- [ ] 除缺损区外不存在可见跳位。
- [ ] 建筑严格正立面。
- [ ] 独立元件使用真实透明背景。
- [ ] 不存在水印、文字、地面或投影。
- [ ] 画风、纸色、线条和饱和度与已有场景统一。

### 16.2 场景

- [ ] 仍然使用 26° 相机。
- [ ] 前、中、后景具有真实 Z 轴间距。
- [ ] 静止时读取为一幅统一水彩画。
- [ ] 滚动和指针视差平滑。
- [ ] 透明边缘没有黑边或互啃。
- [ ] 主物件始终是唯一视觉中心。

### 16.3 修复

- [ ] 点击主物件和按钮均能触发。
- [ ] 只补全缺损区。
- [ ] 四阶段状态与动画一致。
- [ ] 反向动画可恢复残缺态。
- [ ] 动画期间重复点击不会破坏状态。
- [ ] 键盘与低动态模式可用。

### 16.4 工程

- [ ] `npm run build` 成功。
- [ ] Git 工作区只包含本轮明确变更。
- [ ] 原始素材未覆盖。
- [ ] README、场景定义和素材台账同步更新。
- [ ] 用户可自行启动并预览项目。

## 17. 常见失败与处理

| 失败 | 原因 | 处理 |
|---|---|---|
| 完整态和残缺态切换时整体跳动 | 两张图分别生成 | 废弃残缺图，从完整母版重新局部编辑 |
| 建筑像斜放的纸片 | 输入图带 45 度透视 | 重新生成严格正立面或长焦正投影素材 |
| 素材四周出现黑框或白框 | 伪透明背景 | 要求真实 Alpha，验收 `hasAlpha` 并实际叠加检查 |
| 远景抢夺主体注意力 | 对比、锐度或体量过高 | 降低饱和度、线条和 Shader 最大权重 |
| 场景像多张贴纸 | 缺少遮挡、接地和空气透视 | 增加地面、前景遮挡和距离溶解，减少层间整齐排列 |
| 修复像普通换图 | 整体交叉淡化 | 限制修复范围，加入碎片、边缘和阶段反馈 |
| 页面能构建但素材 404 | 路径未进入 `public/assets` | 使用相对项目的稳定文件名并检查 HTTP 返回 |
| 新场景破坏旧场景 | 复制并修改公共循环 | 使用场景定义和注册表，不复制核心引擎 |

## 18. 当前后续工作

1. 用户复看石像场景移除小塔、三个场景静止状态移除石粉后的画面。
2. 若复看发现差异，再按实际画面微调尺寸、接地点、遮挡、缺损范围和距离溶解。
3. 如需密檐塔贴图碎片，使用能够可靠输出 Alpha 的模型逐件生成；当前程序化碎片可继续使用。
4. 新增第四个场景时沿用已拆分的配置模块和注册表。
5. 若转向连续世界，先确认地理路线和两站环境样张，再按连续世界方案改造代码；当前三个独立场景保留作对照。

## 19. 维护规则

- 每生成一张图片，立即更新素材台账。
- 每完成一个可运行阶段，立即提交 Git。
- 实施方案记录设计目标；本文件记录跨场景协议；素材台账记录每张生成图，不得混写。
- 不在文档中写入账号、密钥、隐私数据或不可移植的机器绝对路径。
- 不宣称视觉验收通过；页面视觉验收由用户完成，除非用户明确指定 Agent 验收。
