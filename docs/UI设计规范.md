# UI设计规范 - 智能化采购系统

## 1. 设计理念

科技感、未来感、专业感。采用深色主题配合蓝色渐变强调色，营造高效、可信赖的数字化采购平台视觉体验。

## 2. 色彩系统

### 主色板
| 用途 | 色值 | 说明 |
|------|------|------|
| 主背景 | #0d1117 | 深空黑，主要背景 |
| 次级背景 | #161b22 | 卡片、侧边栏背景 |
| 卡片背景 | #21262d | 内容卡片 |
| 悬浮背景 | #30363d | 交互状态 |
| 主色调 | #0066FF | 科技蓝，主要按钮、链接 |
| 渐变起点 | #0066FF | 渐变起始色 |
| 渐变终点 | #00D4FF | 渐变结束色 |
| 成功色 | #238636 | 成功状态 |
| 警告色 | #d29922 | 警告状态 |
| 错误色 | #da3633 | 错误状态 |
| 边框色 | #30363d | 分隔线、边框 |

### 文字色板
| 用途 | 色值 | 说明 |
|------|------|------|
| 主文字 | #f0f6fc | 标题、重要内容 |
| 次文字 | #8b949e | 说明文字 |
| 弱文字 | #6e7681 | 禁用、占位符 |
| 链接文字 | #58a6ff | 可点击链接 |

### 功能色
```css
/* 状态指示 */
.status-success { color: #238636; background: rgba(35, 134, 54, 0.15); }
.status-warning { color: #d29922; background: rgba(210, 153, 34, 0.15); }
.status-error { color: #da3633; background: rgba(218, 54, 51, 0.15); }
.status-info { color: #58a6ff; background: rgba(88, 166, 255, 0.15); }
```

## 3. 字体系统

### 字体家族
```css
--font-primary: "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-code: "JetBrains Mono", "Fira Code", "Consolas", monospace;
```

### 字号规范
| 级别 | 字号 | 行高 | 用途 |
|------|------|------|------|
| H1 | 28px | 1.3 | 页面标题 |
| H2 | 22px | 1.35 | 模块标题 |
| H3 | 18px | 1.4 | 卡片标题 |
| H4 | 16px | 1.45 | 区块标题 |
| Body | 14px | 1.5 | 正文内容 |
| Small | 12px | 1.5 | 说明文字 |
| Tiny | 11px | 1.4 | 标签、徽章 |

### 字重
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 4. 间距系统

### 基础单位
```css
--space-unit: 4px;
--space-xs: 4px;   /* 1单位 */
--space-sm: 8px;   /* 2单位 */
--space-md: 12px;  /* 3单位 */
--space-lg: 16px;  /* 4单位 */
--space-xl: 24px;  /* 6单位 */
--space-2xl: 32px; /* 8单位 */
--space-3xl: 48px; /* 12单位 */
```

### 页面布局
```css
--page-padding: 24px;
--card-padding: 16px;
--section-gap: 24px;
--component-gap: 12px;
```

## 5. 圆角系统
```css
--radius-sm: 4px;   /* 按钮、输入框 */
--radius-md: 6px;   /* 卡片、弹窗 */
--radius-lg: 8px;   /* 大卡片 */
--radius-xl: 12px;  /* 特殊容器 */
--radius-full: 9999px; /* 圆形 */
```

## 6. 阴影系统
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px rgba(0, 102, 255, 0.3);  /* 发光效果 */
--shadow-glow-strong: 0 0 40px rgba(0, 102, 255, 0.5); /* 强发光 */
```

## 7. 渐变系统
```css
/* 主渐变 - 按钮、强调 */
--gradient-primary: linear-gradient(135deg, #0066FF 0%, #00D4FF 100%);

/* 科技光效 */
--gradient-glow: linear-gradient(135deg, rgba(0, 102, 255, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%);

/* 暗色渐变 */
--gradient-dark: linear-gradient(180deg, #21262d 0%, #161b22 100%);

/* 边框渐变 */
--gradient-border: linear-gradient(135deg, #0066FF, #00D4FF);
```

## 8. 组件规范

### 按钮
```css
/* 主按钮 */
.btn-primary {
  background: var(--gradient-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}

/* 次按钮 */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
}
.btn-secondary:hover {
  background: rgba(0, 102, 255, 0.1);
}

/* 文字按钮 */
.btn-text {
  background: transparent;
  color: var(--color-link);
  border: none;
}
```

### 卡片
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: all 0.2s ease;
}
.card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}
```

### 表格
```css
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}
.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}
.table tr:nth-child(even) {
  background: rgba(22, 27, 34, 0.5);
}
.table tr:hover {
  background: rgba(0, 102, 255, 0.05);
}
```

### 输入框
```css
.input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text-primary);
  transition: all 0.2s ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.2);
}
```

### 导航
```css
/* 侧边导航 */
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}
.nav-item {
  padding: 12px 16px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.nav-item:hover,
.nav-item.active {
  background: rgba(0, 102, 255, 0.1);
  color: var(--color-primary);
}
.nav-item.active {
  border-left: 3px solid var(--color-primary);
}
```

## 9. 动画规范
```css
/* 过渡 */
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;

/* 动画效果 */
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 发光脉冲 */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 102, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 102, 255, 0.6); }
}

/* 加载旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 10. 数据可视化规范

### ECharts 主题配置
```javascript
const theme = {
  color: ['#0066FF', '#00D4FF', '#238636', '#d29922', '#da3633', '#8b949e'],
  backgroundColor: 'transparent',
  textStyle: { color: '#8b949e' },
  title: { textStyle: { color: '#f0f6fc' } },
  legend: { textStyle: { color: '#8b949e' } },
  tooltip: {
    backgroundColor: '#21262d',
    borderColor: '#30363d',
    textStyle: { color: '#f0f6fc' }
  }
};
```

### 图表类型
- **折线图**: 趋势分析、进度跟踪
- **柱状图**: 对比分析、分类统计
- **饼图**: 占比分析、类型分布
- **雷达图**: 多维度评估
- **仪表盘**: 达成率、进度展示
- **热力图**: 数据密度、关联分析

## 11. 响应式断点
```css
--breakpoint-xs: 480px;
--breakpoint-sm: 576px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
--breakpoint-xxl: 1600px;
```

## 12. 图标规范
- 图标库: Ant Design Icons / Remix Icon
- 图标尺寸: 16px / 20px / 24px / 32px
- 图标颜色: 继承文字颜色或使用 currentColor
- 风格: 线性图标，保持一致的描边宽度

## 13. 空状态
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-secondary);
}
.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
```

## 14. 加载状态
```css
/* 骨架屏 */
.skeleton {
  background: linear-gradient(90deg, #21262d 25%, #30363d 50%, #21262d 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

/* 旋转加载 */
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```
