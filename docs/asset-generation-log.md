# 石上旧梦 · 生成素材台账

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
- 场景：`statue`
- 用途：连接主石像与远景古城的中景尺度层。
- 类型：新生成，`zhu2` 调整版仅作为风格参考。
- 尺寸：`1024×1536`。
- Alpha：是。
- 状态：已进入代码。
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

## 3. 待生成资产

| 资产编号 | 文件 | 场景 | 用途 | 状态 |
|---|---|---|---|---|
| ASSET-006 | `public/assets/scenes/pagoda/subject-intact.png` | pagoda | 佛塔完整母版 | 待生成 |
| ASSET-007 | `public/assets/scenes/pagoda/subject-broken.png` | pagoda | 佛塔残缺态 | 依赖 ASSET-006 |
| ASSET-008 | `public/assets/scenes/pagoda/fragments.png` | pagoda | 碎砖与瓦片图集 | 待生成 |
| ASSET-009 | `public/assets/scenes/pagoda/background.png` | pagoda | 佛塔场景远景 | 可先复用石像远景，后续生成 |

## 4. 新资产记录模板

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
