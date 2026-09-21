# 石上旧梦

PC 端 Three.js 遗迹场景。点击残缺石像后，缺损头部以局部 Shader、石粉粒子和状态动画逐步恢复。

## 本地运行

```bash
npm install
npm run dev
```

## 生产构建

```bash
npm run build
npm run preview
```

## 核心实现

- 26° 透视相机与真实 Z 轴分层。
- 可集中调整位置、尺寸和深度的 `sceneConfig.ts`。
- 透明中景佛塔与前景岩石地形带。
- 滚动推进、指针阻尼视差。
- 自定义距离溶解 Shader，不使用 `THREE.Fog`。
- 同一石像双状态的局部补全 Shader。
- 固定在屏幕空间的程序化纸纹后处理。
- PC 专用布局，不包含移动端版本。

## 场景素材

- `background-zhu2-graded.png`：远景古城背景。
- `midground-pagoda.png`：正立面透明中景塔。
- `statue-broken.png`：残缺主石像。
- `statue-intact.png`：完整主石像。
- `foreground-terrain.png`：透明前景岩石地形带。
