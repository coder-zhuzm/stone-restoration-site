# 遗迹修复场景集 · 生成素材台账

## 1. 记录规则

每一张由生成式图像模型创建或编辑的项目素材必须单独登记。记录内容包括：

- 资产编号。
- 最终文件名与项目相对路径。
- 使用场景与用途。
- 生成方式与输入参考。
- 最终提示词。
- 输出尺寸与透明通道。
- 验收结论和限制。
- 是否已进入代码。

生成模型：OpenAI 内置 `imagegen`。当前未使用 CLI、API Key 或 Python 图片处理脚本。

## 2. 已有资产

### ASSET-001 · 石像场景远景

- 最终文件：`public/assets/background-zhu2-graded.png`
- 场景：`statue`
- 用途：唯一完整远景背景板。
- 类型：基于 `zhu2.png` 的精确编辑。
- 输入参考：原始 `zhu2.png`。
- 尺寸：`1672×941`。
- Alpha：否。
- 状态：已进入代码。
- 验收：水印已移除；古城、中央塔、河流和远山保留；对比度、饱和度和细节锐度已降低。
- 限制：只作为完整背景板，不拆分内部元素；不用于其他场景主物件。

最终提示词：

```text
Edit the supplied image into the final far-background plate for a desktop 16:9 Three.js scene. Preserve the existing historic Chinese city, central monumental pagoda, river, distant mountains, watercolor-and-fine-pencil style, and warm aged-paper palette. Remove the bottom-right AI watermark/logo completely and reconstruct that area naturally. Remove any other text, stamps, or logos. Reduce overall contrast by about 20%, reduce saturation by about 12%, lift the darkest ink lines slightly, and soften fine detail so this reads as a distant background rather than the focal subject. Subtly weaken the baked paper grain while keeping an elegant warm ivory paper tone. Keep the central tower slightly left of center, retain generous pale sky, and keep the bottom architecture usable but visually quiet. Do not add any new figures, objects, borders, labels, or modern elements. Output one clean wide landscape image with no transparency.
```

### ASSET-002 · 完整石像

- 最终文件：`public/assets/statue-intact.png`
- 场景：`statue`
- 用途：修复完成态。
- 类型：以原残缺石像为构图参考，重建头部并输出透明图。
- 输入参考：原残缺石像素材。
- 尺寸：`1254×1254`。
- Alpha：是。
- 状态：已进入代码。
- 验收：正立面、单主体、无纸底、无投影；身体、手势、衣纹与莲座形成完整母版。
- 限制：只用于当前石像场景。

最终提示词：

```text
Create the final intact restoration state from this exact damaged seated stone statue. Preserve the supplied statue's canvas position, scale, silhouette below the neck, right raised hand gesture, left hand and circular object, robe folds, shoulders, torso, crossed legs, and lotus pedestal as closely as possible. Reconstruct only the destroyed head and face as a plausible complete ancient East Asian Buddhist stone figure, front-facing and centered, with calm expression and restrained carved hair/crown details that match the existing weathered pale limestone. Remove the small top-left watermark. Isolate the statue and lotus pedestal on a genuinely transparent background with clean softly feathered watercolor edges. No paper rectangle, no floor, no cast shadow, no halo, no debris, no text, no logo, no extra objects. Keep the existing old-paper watercolor and fine pencil line style. Output one square PNG-like image with transparency; the figure must remain perfectly upright and frontal.
```

### ASSET-003 · 残缺石像

- 最终文件：`public/assets/statue-broken.png`
- 场景：`statue`
- 用途：初始残缺态。
- 类型：从 `statue-intact.png` 局部编辑。
- 输入参考：ASSET-002。
- 尺寸：`1254×1254`。
- Alpha：是。
- 状态：已进入代码。
- 验收：损坏集中在头部和面部，身体、双手、衣纹和莲座与完整母版保持一致；破损读取为石材断裂而不是马赛克。
- 限制：生成式编辑仍可能在局部笔触上存在微差；前端只在缺损区域显示完整叠层。

最终提示词：

```text
Edit this exact transparent intact statue into its damaged starting state. Keep the canvas size, statue position, scale, silhouette, torso, both hands, robe folds, crossed legs, lotus pedestal, colors, lighting, and every undamaged area unchanged. Damage only the head and upper face: remove most of the facial features and part of the carved crown with an irregular authentic stone fracture, chipped cavities, exposed rough limestone, and a few fine cracks extending slightly toward the upper neck. The damage must look archaeological, not pixelated, not blurred, not censored, and not like a mosaic. Preserve genuine transparency everywhere outside the statue. Do not add a paper background, shadow, floor, floating debris, glow, text, watermark, or any other object. Output one square transparent image aligned exactly to the supplied source.
```

### ASSET-004 · 中景古塔

- 最终文件：`public/assets/midground-pagoda.png`
- 场景：原 `statue`，当前不在任何场景加载。
- 用途：曾用于连接主石像与远景古城的中景尺度层；现因与石像主题不协调而移出画面。
- 类型：新生成，`zhu2` 调整版仅作为风格参考。
- 尺寸：`1024×1536`。
- Alpha：是。
- 状态：素材留档，未删除；当前场景配置不引用。
- 验收：单塔、正立面、透明背景、无地面和文字。
- 限制：只作为配景，不能充当可修复佛塔的完整母版。

最终提示词：

```text
Use case: historical-scene. Asset type: transparent midground element for a desktop Three.js 2.5D heritage scene. Input image: the supplied zhu2 background is a style and palette reference only; do not copy its full composition. Primary request: create one smaller ancient Chinese brick pagoda or stone reliquary tower, strictly front-facing and vertically upright, suitable for placement in the middle distance. Subject: a single symmetrical tower with a broad lower base, restrained multi-tiered roof details, weathered pale sandstone and muted mineral-red accents. Style/medium: match the reference's warm aged-paper watercolor washes and fine graphite/pencil outlines, with slightly softened midground detail. Composition: entire structure visible, centered, orthographic or very long-lens frontal view; generous transparent margin around it. Lighting/mood: soft diffuse daylight, no dramatic highlights. Constraints: genuinely transparent background; only one tower; no ground, horizon, cast shadow, trees, people, mountains, walls, debris, text, stamp, logo, watermark, border, or paper rectangle. Avoid: 45-degree perspective, side view, photorealistic rendering, heavy black ink, saturated colors.
```

### ASSET-005 · 前景岩石地形带

- 最终文件：`public/assets/foreground-terrain.png`
- 场景：`statue`
- 用途：画面下沿遮挡、接地和近景视差。
- 类型：新生成，`zhu2` 调整版仅作为风格参考。
- 尺寸：`2172×724`。
- Alpha：是。
- 状态：已进入代码。
- 验收：一条连续横向地形带，真实透明，无建筑和文字。
- 限制：跨场景复用时必须改变裁切、比例或镜像，避免重复感。

最终提示词：

```text
Use case: stylized-concept. Asset type: transparent foreground terrain strip for a desktop Three.js 2.5D heritage scene. Input image: the supplied zhu2 background is a style and palette reference only. Primary request: create one wide, low cluster of weathered pale limestone rocks, broken stone slabs, sparse dry grass, and a shallow eroded earth ridge that can sit across the lower edge of the scene. Style/medium: match the reference's warm aged-paper watercolor washes and delicate graphite outlines; slightly stronger detail than the distant background but still restrained. Composition: one continuous horizontal foreground element, low silhouette, widest at the bottom, uneven natural top edge, no important detail near the outer edges, approximately three times wider than tall. Lighting/mood: soft diffuse daylight. Color palette: bone white, sandstone gray, faded sage, muted warm ochre. Constraints: genuinely transparent background around and above the terrain; no rectangular paper field; no separate floating stones; no ground plane beyond the single terrain strip; no cast shadow; no buildings, statues, people, animals, trees, text, stamp, logo, watermark, or border. Avoid: photorealism, thick black outlines, high saturation, dramatic perspective.
```

## 3. 佛塔资产状态

| 资产编号 | 文件 | 场景 | 用途 | 状态 |
|---|---|---|---|---|
| ASSET-006 | `public/assets/scenes/pagoda/subject-intact.png` | pagoda | 佛塔完整母版 | 已进入代码 |
| ASSET-007 | `public/assets/scenes/pagoda/subject-broken.png` | pagoda | 佛塔残缺态 | 已进入代码 |
| ASSET-008 | `public/assets/scenes/pagoda/fragments.png` | pagoda | 碎砖与瓦片图集 | 已进入代码 |
| ASSET-009 | `public/assets/scenes/pagoda/background.png` | pagoda | 佛塔场景远景 | 已进入代码 |
| ASSET-010 | `public/assets/scenes/pagoda/midground.png` | pagoda | 佛塔场景中景残墙 | 已进入代码 |
| ASSET-011 | `public/assets/scenes/pagoda/foreground.png` | pagoda | 佛塔场景前景砖瓦带 | 已进入代码 |

## 4. 佛塔场景首批资产

### ASSET-006 · 完整五层佛塔

- 最终文件：`public/assets/scenes/pagoda/subject-intact.png`
- 场景：`pagoda`
- 用途：佛塔修复完成态和残缺态唯一母版。
- 类型：新生成。
- 输入参考：`midground-pagoda.png` 作为笔触与材质参考；`background-zhu2-graded.png` 作为环境色调参考。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`1024×1536`。
- Alpha：是。
- 状态：已进入代码。
- 验收：完整五层结构，严格正立面，完整显示基础、塔身、檐口和塔刹；无地面、文字和水印。
- 限制：透明边缘存在生成模型常见的彩色像素晕边，页面中应使用 `alphaTest`、纸色融合和适度缩小控制。

最终提示词：

```text
Use case: historical-scene. Asset type: transparent primary restoration subject for a desktop Three.js 2.5D heritage scene. Input images: Image 1 is a style and palette reference for watercolor line quality only; Image 2 is a wider environment style reference only. Do not copy Image 1's exact three-tier geometry. Primary request: create one complete monumental ancient Chinese Buddhist brick-and-stone pagoda with five clearly differentiated tiers, strictly front-facing, vertically upright and symmetrical. Show the entire stepped foundation, tower body, every eave, roof ridge, upper drum, and tall finial without cropping. Style/medium: warm aged-paper watercolor washes combined with delicate graphite and fine pencil outlines; muted bone white, limestone gray, pale sage, restrained mineral red and warm ochre; soft diffuse daylight, low contrast, subtle archaeological weathering. Composition: orthographic or very long-lens frontal view, centered on one fixed tall canvas with generous genuinely transparent margin. Materials: weathered pale sandstone, faded brick red, gray roof tiles, subtle age stains while remaining structurally complete. Constraints: genuinely transparent background; only one pagoda; no ground, horizon, cast shadow, trees, mountains, walls, people, animals, text, seal, logo, watermark, border, halo, glow, or paper rectangle. Avoid: 45-degree perspective, side view, wide-angle distortion, missing eaves, asymmetrical roof tiers, black background, photorealism, thick black outlines, saturated colors.
```

### ASSET-007 · 残缺五层佛塔

- 最终文件：`public/assets/scenes/pagoda/subject-broken.png`
- 场景：`pagoda`
- 用途：佛塔场景初始残缺态。
- 类型：从 ASSET-006 局部编辑。
- 输入参考：ASSET-006。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`1024×1536`。
- Alpha：是。
- 状态：已进入代码。
- 验收：破损集中在塔刹、最高层右侧檐角和最高层塔身；下部四层、基础、门窗和整体位置保持一致；破损读取为砖石与瓦片断裂。
- 限制：生成式编辑可能在最高层未损坏线条中产生轻微差异；前端修复区域必须限制在画面上部。

最终提示词：

```text
Use case: precise-object-edit. Asset type: damaged starting state paired with the supplied intact pagoda for a Three.js restoration scene. Input image: the supplied transparent intact five-tier pagoda is the sole geometry, composition, palette, lighting, canvas and style source. Primary request: damage only the upper portion of this exact tower. Remove most of the tall finial above the highest roof, break away the viewer-right corner of the highest eave, and create one limited irregular missing-masonry patch in the uppermost tower body. Add authentic chipped gray roof tiles, fractured brick edges, exposed rough pale stone and a few restrained cracks. Invariants: keep the exact same canvas size, tower position, scale, frontal orthographic projection, stepped foundation, lower four tiers, doors, windows, undamaged roof lines, colors, lighting, watercolor-pencil style and genuine transparency. Constraints: no global redraw, no new architecture, no perspective change, no floating debris, no ground, no cast shadow, no glow, no text, no watermark, no paper rectangle. Avoid: mosaic blocks, blur, censor-like damage, perfectly rectangular holes, fire or soot, vegetation, collapse of the entire building. Output one transparent image aligned exactly to the supplied source.
```

### ASSET-008 · 佛塔碎砖与瓦片图集

- 最终文件：`public/assets/scenes/pagoda/fragments.png`
- 场景：`pagoda`
- 用途：提供佛塔修复特有的瓦片、砖块、塔刹和檐角纹理参考；首版代码可以继续使用程序化三维石片。
- 类型：新生成。
- 输入参考：ASSET-006。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`1246×1262`。
- Alpha：是。
- 状态：已进入代码。
- 验收：包含八组相互分离的檐角、砖墙、塔刹和斗拱残片；透明背景；风格与主塔一致。
- 限制：当前按规则的 `2 列 × 4 行` UV 图集切分为八个透明面片；图集切片只能用于佛塔场景，石像继续使用程序化三维石片。

最终提示词：

```text
Use case: stylized-concept. Asset type: transparent restoration fragment atlas for the supplied five-tier Buddhist pagoda. Input image: the supplied intact pagoda is the sole material, palette and drawing-style reference. Primary request: create one compact set of 8 separate weathered architectural fragments that could plausibly come from the damaged upper part of this exact tower: two curved gray roof-tile corner pieces, two muted mineral-red brick chunks, two pale sandstone finial fragments, and two small carved eave pieces. Style/medium: the same warm aged-paper watercolor washes and delicate graphite outlines as the supplied tower. Composition: pieces separated from one another with clear generous transparent gaps, no overlap, each fully visible, mostly frontal or near-frontal views, arranged as a clean atlas. Constraints: genuinely transparent background; no ground, cast shadow, dust cloud, full building, people, plants, text, seal, logo, watermark, border, black field or paper rectangle. Avoid: photorealism, saturated color, dramatic lighting, random rocks unrelated to the tower.
```

## 5. 佛塔场景专属环境资产

### ASSET-009 · 佛塔山谷远景

- 最终文件：`public/assets/scenes/pagoda/background.png`
- 场景：`pagoda`
- 用途：佛塔章节专属完整远景板。
- 类型：新生成。
- 输入参考：原石像远景、ASSET-006 与原石像前景。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`1672×941`。
- Alpha：否。
- 状态：已进入代码。
- 验收：宽幅山谷、河滩、低矮寺院建筑和遗址形成多层远景；画面中没有第二座高塔；中央偏右区域保持安静，可承托主佛塔。
- 限制：生成图底部自带少量近景遗址，前端以独立中景和前景遮挡、分层，不再从本图抠取单体。

最终提示词：

```text
Use case: historical-scene. Asset type: dedicated far-background plate for the pagoda chapter of a desktop Three.js 2.5D restoration scene. Input images: Image 1 is the existing wide heritage background and is the reference for warm aged-paper watercolor, fine graphite lines, low contrast and pale atmosphere; Image 2 is the restored five-tier pagoda and is the reference for brick, tile and sandstone colors only; Image 3 is the existing foreground strip and is a palette reference only. Primary request: create a quiet wide 16:9 ancient Chinese Buddhist monastery valley seen frontally through a long lens, with layered misty mountain ridges, a broad pale river or dry valley, low ruined temple foundations, distant low courtyard walls and sparse weathered trees. The center-right must remain visually calm and open so a large transparent five-tier pagoda can later be placed there as the sole focal subject. Do not include any prominent pagoda, tall tower, giant statue or large foreground object. Style/medium: refined warm ivory paper watercolor washes with delicate graphite and pencil outlines, matching the reference images; softened distant detail, low saturation and low contrast. Composition/framing: wide landscape, level horizon, generous pale sky occupying about the upper half, layered depth from mountains to low ruins, no close foreground ridge. Lighting/mood: soft diffuse morning light, restrained archaeological calm. Color palette: warm ivory, pale limestone gray, faded sage, dusty ochre and very restrained mineral red. Constraints: one clean opaque background image; no text, stamp, logo, watermark, border, modern objects, crowds, dramatic sun, heavy fog, black field or paper frame. Avoid: a second dominant tower, 45-degree architectural perspective, photorealism, thick black outlines, saturated colors, high contrast, busy center-right details.
```

### ASSET-010 · 寺院残墙中景

- 最终文件：`public/assets/scenes/pagoda/midground.png`
- 场景：`pagoda`
- 用途：连接远景山谷与主佛塔的横向中景尺度层。
- 类型：新生成。
- 输入参考：原石像远景、ASSET-006、原石像前景和 ASSET-009。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`2172×724`。
- Alpha：是。
- 状态：已进入代码。
- 验收：单个连续横向建筑元件、严格正立面、真实透明；中间月门、两侧残墙和瓦顶体量低于主佛塔。
- 限制：月门内部为透明洞口；该素材只能作为中景残墙，不作为可修复主物件。

最终提示词：

```text
Use case: historical-scene. Asset type: transparent midground architectural strip for the dedicated pagoda chapter of a desktop Three.js 2.5D restoration scene. Input images: Image 1 is the original wide heritage scene and sets the warm aged-paper watercolor and graphite style; Image 2 is the restored five-tier pagoda and sets the pale brick, mineral-red wood and gray-tile material palette; Image 3 is the existing foreground strip and shows the required genuine transparency behavior; Image 4 is the newly generated monastery-valley background and sets the exact environmental mood. Primary request: create one single low, continuous ruined Buddhist monastery courtyard element: a weathered frontal wall with one modest central moon gate, short broken side walls, several exposed pale stone foundation courses, and two small collapsed gray-tile roof sections. It must remain much lower than the supplied main pagoda and act only as a middle-distance scale layer. Style/medium: the same warm ivory watercolor washes and delicate graphite outlines, with softened midground detail and restrained archaeological weathering. Composition/framing: wide horizontal element, approximately 3.2 times wider than tall, strict frontal or very-long-lens view, complete silhouette, centered, generous transparent margin, no deep 45-degree side walls. Lighting/mood: soft diffuse daylight, low contrast. Color palette: pale limestone, dusty warm brick, muted mineral red, weathered gray tile and faded sage traces. Constraints: genuinely transparent background; one connected architectural element only; no ground plane, horizon, cast shadow, full pagoda, tall tower, statue, people, trees, mountains, text, stamp, logo, watermark, border, glow, black field or paper rectangle. Avoid: photorealism, saturated colors, thick black outlines, dramatic ruins, scattered disconnected objects.
```

### ASSET-011 · 佛塔砖瓦前景带

- 最终文件：`public/assets/scenes/pagoda/foreground.png`
- 场景：`pagoda`
- 用途：佛塔章节画面下沿遮挡、接地和近景视差。
- 类型：新生成。
- 输入参考：原石像远景、ASSET-006、原石像前景、ASSET-009 与 ASSET-010。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`2172×724`。
- Alpha：是。
- 状态：已进入代码。
- 验收：连续横向地形带，中心较低、左右较重；包含塔砖、灰瓦、基础石和枯草；真实透明，无完整建筑和文字。
- 限制：只为佛塔场景设计；放入其他场景会带来明显的砖瓦语义。

最终提示词：

```text
Use case: stylized-concept. Asset type: transparent foreground terrain strip for the dedicated pagoda chapter of a desktop Three.js 2.5D restoration scene. Input images: Image 1 is the original wide heritage background and sets the watercolor-pencil style; Image 2 is the intact five-tier pagoda and sets the brick, tile and sandstone materials; Image 3 is the existing rock foreground and is the exact composition and transparency reference; Image 4 is the new pagoda-valley background and sets the environmental palette; Image 5 is the new ruined monastery wall and sets the degree of weathering. Primary request: create one continuous low foreground ridge made from weathered pale foundation stones, a few muted mineral-red ancient brick fragments, several broken gray curved roof tiles, sparse faded dry grass and shallow dusty earth. It should feel like archaeological debris around the five-tier pagoda without becoming a pile of separate floating objects. Style/medium: warm aged-paper watercolor washes and delicate graphite outlines matching all supplied references; foreground detail slightly stronger than the background but still refined and restrained. Composition/framing: one wide horizontal element approximately three times wider than tall, widest along the bottom edge, irregular natural top silhouette, slightly heavier clusters near the left and right thirds, a lower quieter center so the main pagoda remains visible; every edge fully contained. Lighting/mood: soft diffuse daylight, no dramatic highlights. Color palette: bone white, limestone gray, dusty ochre, muted terracotta red, weathered tile gray and faded sage. Constraints: genuinely transparent background around and above the strip; no paper rectangle, ground plane beyond this single strip, cast shadow, full wall, gate, complete pagoda, statue, people, animals, text, stamp, logo, watermark, border or black field. Avoid: photorealism, thick black outlines, saturated colors, disconnected floating fragments, very tall rocks, strong perspective.
```

## 6. 密檐砖塔场景资产

### ASSET-012 · 完整十一层密檐砖塔

- 最终文件：`public/assets/scenes/brick-pagoda/subject-intact.png`
- 场景：`brick-pagoda`
- 用途：第三场景修复完成态和残缺态唯一母版。
- 类型：新生成。
- 输入参考：五层佛塔主体及其远、中、前景，仅参考笔触、纸色和材质。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`1024×1536`。
- Alpha：是。
- 状态：已进入代码。
- 验收：十一层瘦高塔身、完整塔基、层层密檐和塔刹；严格正立面；与五层楼阁式佛塔轮廓明显不同。
- 限制：部分密檐仍保留较明显的瓦顶曲线，属于密檐塔的水彩风格化表达，不作为建筑测绘图使用。

最终提示词：

```text
Use case: historical-scene. Asset type: transparent primary restoration subject for a third desktop Three.js 2.5D heritage scene. Input images: Image 1 is the existing five-tier pagoda and is a style, palette and edge-quality reference only; do not copy its pavilion-tower geometry. Image 2 is the pagoda valley background and sets the warm paper atmosphere. Images 3 and 4 are midground and foreground references for material harmony only. Primary request: create one complete ancient Chinese eleven-storey square dense-eave brick pagoda, strictly front-facing, vertically upright and symmetrical. It must be visibly different from the supplied five-tier pavilion pagoda: a tall slender tapering body, eleven closely stacked shallow brick eaves, small centered arched niches, a substantial square stone plinth, and a restrained metal or stone finial. Show the entire foundation, every dense eave, upper crown and finial without cropping. Style/medium: warm aged-paper watercolor washes with delicate graphite and fine pencil outlines, muted archaeological detail, matching the supplied scene. Materials: weathered ochre-red brick, pale limestone bands, dark gray shallow tile or brick eaves, restrained mineral stains. Composition/framing: orthographic or very-long-lens frontal elevation, centered on one tall portrait canvas with generous genuinely transparent margin. Lighting/mood: soft diffuse daylight, low contrast, dignified and quiet. Constraints: genuinely transparent background; only one pagoda; no ground, horizon, cast shadow, trees, mountains, walls, people, animals, text, seal, logo, watermark, border, glow, paper rectangle or black field. Avoid: 45-degree perspective, side view, wide pavilion roofs, five large storeys, open balconies, photorealism, thick black outlines, saturated red.
```

### ASSET-013 · 残缺十一层密檐砖塔

- 最终文件：`public/assets/scenes/brick-pagoda/subject-broken.png`
- 场景：`brick-pagoda`
- 用途：第三场景初始残缺态。
- 类型：从 ASSET-012 局部编辑。
- 输入参考：ASSET-012。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`1024×1536`。
- Alpha：是。
- 状态：已进入代码。
- 验收：损坏集中在塔刹、最上三层右侧檐角和上部砖身；下部八层、塔基、门洞与整体位置保持一致。
- 限制：修复 Shader 必须限制在图像上部，避免完整态差异扩散到未损坏层。

最终提示词：

```text
Use case: precise-object-edit. Asset type: damaged starting state paired with the supplied intact eleven-storey brick pagoda for a Three.js restoration scene. Input image: the supplied transparent eleven-storey pagoda is the sole geometry, composition, canvas, palette, lighting and style source. Primary request: damage only the upper portion of this exact tower. Break away the upper half of the finial, remove an irregular section from the viewer-right corners of the highest three shallow eaves, and create one limited chipped-brick cavity in the tower body directly below those eaves. Show authentic fractured ochre brick, broken gray tiles, rough pale mortar and restrained cracks. Invariants: keep the exact same canvas size, tower position, scale, frontal projection, square foundation, entrance, lower eight storeys, all undamaged niches, all undamaged eaves, colors, lighting, watercolor-pencil style and genuine transparency. Constraints: no global redraw, no perspective change, no floating debris, no ground, cast shadow, fire, soot, plants, glow, text, watermark, paper rectangle or black background. Avoid: mosaic blocks, blur, censor-like damage, perfectly rectangular holes, collapse of the entire tower. Output one transparent image aligned exactly to the supplied source.
```

### ASSET-014 · 密檐塔荒原远景

- 最终文件：`public/assets/scenes/brick-pagoda/background.png`
- 场景：`brick-pagoda`
- 用途：第三场景专属完整远景板。
- 类型：新生成。
- 输入参考：密檐塔主体和佛塔山谷远景。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`1672×941`。
- Alpha：否。
- 状态：已进入代码。
- 验收：黄土荒原、干涸河床、石窟和远山建立北方场景语义；画面没有第二座高塔。
- 限制：右侧寺院建筑只作为远景色块，不能拆成独立建筑素材。

最终提示词：

```text
Use case: historical-scene. Asset type: dedicated opaque far-background plate for an eleven-storey dense-eave brick pagoda restoration chapter. Input images: use the recent eleven-storey pagoda imagery as the subject material reference and the supplied wide valley scene as the watercolor-paper style reference. Primary request: create a quiet wide 16:9 northern Chinese loess plateau and ancient temple frontier landscape seen frontally through a long lens: layered eroded ochre cliffs, distant pale mountains, a broad dry riverbed, low cave-temple openings and scattered ruined foundation lines. Leave the center-left visually calm and open so a tall transparent brick pagoda can later stand there as the sole focal subject. Do not include any prominent pagoda, tower, giant statue or close foreground wall. Style/medium: refined warm ivory paper watercolor washes with delicate graphite lines, restrained dusty atmosphere, lower saturation and softer detail than the main subject. Composition/framing: wide level horizon, generous pale sky in the upper half, layered depth, no close foreground ridge. Lighting/mood: soft diffuse late-morning light, dry archaeological calm. Color palette: warm ivory, loess ochre, dusty brick red, pale limestone, faded sage and blue-gray distant ridges. Constraints: one clean opaque background; no text, stamp, logo, watermark, border, modern objects, crowds, dramatic sun, heavy gray fog, black field or paper frame. Avoid: a second dominant tower, 45-degree architecture, photorealism, thick black outlines, high contrast, saturated orange.
```

### ASSET-015 · 石窟崖壁中景

- 最终文件：`public/assets/scenes/brick-pagoda/midground.png`
- 场景：`brick-pagoda`
- 用途：连接荒原远景与密檐塔的中景尺度层。
- 类型：新生成。
- 输入参考：密檐塔主体和 ASSET-014。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`2206×713`。
- Alpha：是。
- 状态：已进入代码。
- 验收：单个连续横向黄土崖壁，包含五个小型石窟洞口、残砖、基础石和植被；背景真实透明。
- 限制：洞口内部为深色颜料而非透明洞口，以保持中景实体感。

最终提示词：

```text
Use case: historical-scene. Asset type: transparent midground strip for the eleven-storey brick pagoda chapter. Input images: use the recent eleven-storey pagoda imagery for brick and stone material harmony and the newly generated loess plateau background for exact landscape mood and palette. Primary request: create one connected low loess-cliff monastery remnant viewed frontally: a horizontal eroded ochre cliff face with five small dark cave-temple openings, a broken pale stone retaining base, a short ruined brick parapet and sparse faded shrubs embedded in the cliff. It must stay low and wide, serving only as a middle-distance depth layer behind the main pagoda. Style/medium: warm aged-paper watercolor washes with delicate graphite outlines, restrained archaeological detail, matching the supplied scene. Composition/framing: approximately 3.2 times wider than tall, strict frontal or very-long-lens view, one connected silhouette, complete edges, generous transparent margin, no deep side perspective. Lighting/mood: soft diffuse daylight, low contrast. Color palette: loess ochre, dusty brick red, pale limestone, faded sage and gray-brown cave interiors. Constraints: genuinely transparent background around and above the single cliff element; no ground plane beyond the element, horizon, cast shadow, full pagoda, tall tower, people, large trees, distant mountains, text, stamp, logo, watermark, border, glow, black field or paper rectangle. Avoid: photorealism, saturated orange, thick black outlines, dramatic overhangs, scattered disconnected rocks.
```

### ASSET-016 · 密檐塔砖石前景

- 最终文件：`public/assets/scenes/brick-pagoda/foreground.png`
- 场景：`brick-pagoda`
- 用途：第三场景下沿遮挡、接地和近景视差。
- 类型：新生成。
- 输入参考：密檐塔主体、ASSET-014 和 ASSET-015。
- 生成模型：OpenAI 内置 `imagegen`。
- 生成日期：`2026-09-22`。
- 尺寸：`2172×724`。
- Alpha：是。
- 状态：已进入代码。
- 验收：连续横向地形带，中心低、左右重；包含黄土、旧砖、浅色基石、灰瓦和枯草；真实透明。
- 限制：砖石语义和黄土色调为第三场景专用。

最终提示词：

```text
Use case: stylized-concept. Asset type: transparent foreground terrain strip for the eleven-storey dense-eave brick pagoda chapter. Input images: use the recent eleven-storey pagoda imagery for brick, stone and eave materials; use the newly generated loess plateau background and cave-temple midground for the exact dry northern palette and weathering. Primary request: create one continuous low foreground ridge made from eroded loess earth, weathered ochre-red ancient bricks, pale rectangular foundation stones, a few broken shallow gray eave tiles and sparse faded dry grass. The ridge should feel related to a dense-eave brick tower without becoming a collection of floating objects. Style/medium: warm aged-paper watercolor washes with delicate graphite outlines; slightly stronger foreground detail than the background but still restrained. Composition/framing: one horizontal element approximately three times wider than tall, widest along the bottom, natural uneven top edge, heavier brick-and-stone clusters near the left and right thirds, a low quiet center opening so the tower base stays visible, all edges contained. Lighting/mood: soft diffuse daylight. Color palette: loess ochre, dusty brick red, pale limestone, gray tile and faded sage. Constraints: genuinely transparent background around and above the strip; no paper rectangle, extra ground plane, cast shadow, full wall, cave facade, complete pagoda, people, animals, text, stamp, logo, watermark, border or black field. Avoid: photorealism, thick black outlines, saturated orange, disconnected fragments, very tall rocks, strong perspective.
```

### REJECTED-001 · 密檐塔碎片图集

- 目标：生成规则 `2×4` 的八块密檐塔碎片图集。
- 尝试次数：2。
- 结果：八块碎片的排列和内容合格，但两次输出均带棕色渐变纸底，没有真实 Alpha。
- 处理：未复制到项目、未接入代码；第三场景使用按砖石配色配置的程序化三维碎片。
- 复用建议：后续应逐件生成透明碎片，或使用能够可靠输出 Alpha 的模型重新生成，不应通过固定白色阈值强行抠底。

## 7. 新资产记录模板

~~~~text
### ASSET-NNN · 名称

- 最终文件：
- 场景：
- 用途：
- 类型：新生成／精确编辑／背景提取／风格迁移。
- 输入参考：
- 生成模型：
- 生成日期：
- 尺寸：
- Alpha：
- 状态：待验收／已验收／已进入代码／已废弃。
- 验收：
- 限制：

最终提示词：

```text
...
```
~~~~
