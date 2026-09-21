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
- 滚动推进、指针阻尼视差。
- 自定义距离溶解 Shader，不使用 `THREE.Fog`。
- 同一石像双状态的局部补全 Shader。
- 固定在屏幕空间的程序化纸纹后处理。
- PC 专用布局，不包含移动端版本。
