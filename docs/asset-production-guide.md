# 遗迹修复素材生产指南

> 状态：当前项目的可复用方法。逐张已采用的原始提示词和验收结论，以 [素材生成台账](asset-generation-log.md) 为准。本文不是某家图像模型的能力保证。

## 1. 适用范围与实际做法

本项目的网页消费最终 PNG：完整远景可以不透明，独立古迹和遮挡带必须有真实 Alpha。当前三个场景的素材由 ChatGPT 内置 `imagegen` 生成或编辑，未实施 Python 批量抠图、自动元数据管线或旧版模型研究文档提出的“mask 外强制像素合成”。石像先参考原残缺素材制作完整母版，再从该完整母版生成最终残缺态。前端用同位置叠层与局部 Shader 完成补全。

台账记录了最终使用的提示词、参考来源、尺寸和用途；早期素材没有完整模型快照、seed、每轮失败样本及调用成本，不能声称可逐像素复现。后续生产应补记这些信息，但不得编造。

图像工具不限于 OpenAI。更换模型时，先用同一组参考和验收标准制作少量样张；模型名称、价格、透明输出与编辑能力须在正式生产时重新核实。模型负责生成内容，人负责验收构图、透明边缘和双状态对齐。

## 2. 先定义主题，再写提示词

换成新古迹时，不要只替换“佛塔”二字。先确定以下五项，并作为所有素材共用的简短风格卡：

| 项目 | 必须写清 |
|---|---|
| 历史与地理 | 古迹类型、地域、年代范围、周边地貌；避免混用不相干建筑语汇 |
| 画法 | 水彩、铅笔、版画等媒介；线条粗细、纸色、明暗和饱和度 |
| 材料 | 石灰岩、砂岩、砖、木、瓦等；损坏形态必须符合材料 |
| 视角 | 可修复主物件严格正立面或极长焦正面；远景与地形可有自身空间关系 |
| 修复叙事 | 完整态是什么、缺了哪里、碎片从哪里来、修复后读成什么 |

当前“旧纸水彩＋细铅笔线”只适用于本项目。跨主题时可以保留这种画法，也可以另定画法，但同一连续世界中的所有素材必须使用同一张风格卡。若主题依赖绕物体观察、强侧面或复杂体积，这套竖直面片方法需重新评估，不能强行套用。

## 3. 单个可修复古迹的生产顺序

1. 生成或确定唯一完整母版。画布里只有主物件；正立面、完整轮廓、无地面和投影、背景真实透明。
2. 验收完整母版的形制、比例、画风和 Alpha。未通过时不开始残缺态。
3. 以完整母版为唯一几何参考，局部编辑残缺态；固定画布、位置、比例、光线与未损坏区。
4. 将两张图叠加检查。除了指定缺损区域，主体轮廓和纹理不应明显跳位；两图像素尺寸必须相同。
5. 如修复动画需要贴图碎片，再制作与缺损材料一致的独立碎片；无法得到真实透明图集时使用程序化碎片，不以固定白色阈值硬抠。
6. 记录生成工具、输入参考、完整提示词、日期、尺寸、Alpha、验收、失败原因与最终文件名。原文件不覆盖。

提示词不能替代验收。“保持未编辑区域不变”是对模型的要求，不等于模型已经做到。严格像素一致的新项目可增设 mask 与确定性合成，但那是额外工序；当前站点没有实施，不能写成既有能力。

### 3.1 完整母版提示词骨架

```text
Create one complete [MONUMENT] for a desktop 2.5D heritage-restoration scene.
Use [STYLE CARD] and historically coherent [MATERIALS / ARCHITECTURAL DETAILS].
Show the entire object, strictly front-facing and vertically upright, on a fixed canvas.
Keep the silhouette clear, with enough transparent margin for later local editing.
Output a genuinely transparent image containing only this one object.
No ground, cast shadow, glow, debris, people, text, watermark, paper rectangle,
45-degree perspective, or cropped structural parts.
```

### 3.2 残缺态局部编辑提示词骨架

```text
Edit the supplied intact [MONUMENT] into its damaged starting state.
The supplied intact image is the sole source for geometry, composition and style.
Damage only [EXACT REGION] as authentic [MATERIAL-SPECIFIC FRACTURE].
Preserve the exact canvas, position, scale, silhouette and every undamaged area.
Keep genuine transparency outside the object. Do not add floating debris,
ground, shadow, text or any other object. Avoid blur, mosaic blocks and
perfectly rectangular damage. Return one image aligned to the input.
```

## 4. 连续世界的环境素材与改图

连续世界不是三张独立完整远景的拼贴。先画一张沿滚动路线展开的构图草图，确定统一天际线、光线、地貌演变、河流或道路等连续线索，再生产分段素材。每段要有前后衔接参考和可遮挡接缝的透明前景；不要把将来要互动修复的古迹画死在远景里。

如果模型不能稳定生成整条长画卷，采用“总构图参考 → 相邻段逐段编辑 → 边界叠加验收”。相邻段共用同一风格卡，并交叉提供上一段尾部和下一段草图。交界处必须检查地平线、道路／水流方向、纸色、光照和建筑尺度，不能仅靠前端淡入淡出掩盖不连续。

### 4.1 环境分段提示词骨架

```text
Create the next continuous landscape section of one long heritage-world painting.
Use the supplied world storyboard and adjacent section as composition references.
Continue the same horizon height, terrain contour, road or river direction,
daylight, paper tone, line weight and muted palette across the shared edge.
This section represents [LOCATION / TERRAIN TRANSITION] and leaves a calm
visual opening at [INTERACTIVE SITE POSITION] for a separate transparent monument.
No hard scene cut, duplicate landmark, dominant baked-in repair subject, text,
watermark, frame, or abrupt change of artistic medium.
```

### 4.2 过渡遮挡带提示词骨架

```text
Create one continuous transparent foreground or midground band for [LOCATION].
It should connect the previous and next landscape sections using [SHARED TERRAIN
MATERIAL], with a lower central opening for the camera's approach to the site.
Match the world style card. Use genuine Alpha outside the single continuous band.
No complete monument, independent floating pieces, cast shadow, paper rectangle,
text or watermark.
```

## 5. 进入代码前的硬验收

- 主物件一图一件；建筑正立面；完整态与残缺态尺寸、位置、轮廓对齐。
- 透明素材确有 Alpha，边缘叠在项目纸色和深色底上均无明显黑边、白框或彩色噪点。
- 图中没有地面、投影、漂浮碎片、文字或水印；远景例外允许完整地貌，但不得包含待互动的主物件。
- 同一世界所有段落的纸色、笔触、光线、地平线和尺度连贯。
- 每张最终文件进入 [素材台账](asset-generation-log.md)，同时标记“当前加载／留档／废弃”。失败样张不能冒充最终素材。

当前三个场景已使用的逐张提示词见素材台账；连续世界的空间和交互约束见 [连续世界方案](continuous-world-plan.md)。
