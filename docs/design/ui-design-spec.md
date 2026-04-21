# Youdao ERP UI Design Specification

> **有道食品经销存管理系统** - 视觉设计规范 v2.0
> **设计风格**: Linear 极简科技风（深色默认 + 可切换浅色）
> **品牌色**: 紫蓝 #7C5CFC
> **参考**: Linear.app 设计哲学 — 极致深色、高对比度、精确边框

---

## 1. 设计概述

**设计哲学**: 借鉴 Linear 的极简主义，用精确的边框、克制的色彩和深邃的背景层级，打造一套专业、冷静、高效的经销商管理工具。

**核心关键词**: 精确 · 克制 · 深邃 · 高效

**适用场景**: 食品/日用品行业进销存管理，支持 PC 网页端 + Android 移动端

---

## 2. 色彩系统

### 2.1 CSS 变量

```css
/* 深色模式（默认） */
:root {
  --bg-base: #0C0C0C;
  --bg-elevated: #111111;
  --bg-surface: #161616;
  --bg-hover: #1C1C1C;
  --bg-active: #222222;

  --accent-primary: #7C5CFC;
  --accent-secondary: #5B8DEF;
  --accent-hover: #9173FD;
  --accent-subtle: rgba(124, 92, 252, 0.12);
  --accent-border: rgba(124, 92, 252, 0.25);

  --gradient-primary: linear-gradient(135deg, #7C5CFC 0%, #5B8DEF 100%);
  --gradient-subtle: linear-gradient(135deg, rgba(124,92,252,0.1) 0%, rgba(91,141,239,0.1) 100%);

  --text-primary: #FFFFFF;
  --text-secondary: #8A8F98;
  --text-tertiary: #6E7681;
  --text-muted: #4A4F58;

  --color-success: #4CAF7C;
  --color-warning: #F5A623;
  --color-danger: #EF4A4A;
  --color-info: #4F8CFF;

  --border-subtle: rgba(255,255,255,0.06);
  --border-medium: rgba(255,255,255,0.1);
  --border-strong: rgba(255,255,255,0.15);

  --shadow-card: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.4);
}

/* 浅色模式 */
[data-theme="light"] {
  --bg-base: #F7F7F8;
  --bg-elevated: #FFFFFF;
  --bg-surface: #F0F0F2;
  --bg-hover: #E8E8EA;
  --bg-active: #E0E0E3;

  --gradient-primary: linear-gradient(135deg, #6B4FD9 0%, #4A7BD9 100%);
  --gradient-subtle: linear-gradient(135deg, rgba(107,79,217,0.08) 0%, rgba(74,123,217,0.08) 100%);

  --text-primary: #111111;
  --text-secondary: #5C5C66;
  --text-tertiary: #8E8E99;
  --text-muted: #B8B8BF;

  --border-subtle: rgba(0,0,0,0.06);
  --border-medium: rgba(0,0,0,0.1);
  --border-strong: rgba(0,0,0,0.15);

  --shadow-card: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.08);
}
```

### 2.2 色彩使用规则

| 场景 | 颜色 | 效果 |
|------|------|------|
| 品牌按钮 | `var(--accent-primary)` | 纯色，悬停微亮 |
| 数据统计高亮 | `var(--accent-primary)` | 纯色，无渐变 |
| 库存预警 | `#F5A623` + 脉冲动画 | 黄色呼吸灯效果 |
| 库存缺货 | `#EF4A4A` | 纯红色，无发光 |
| 库存正常 | `#4CAF7C` | 纯绿色 |
| 选中状态 | `var(--accent-subtle)` + 紫蓝边框 | 清晰但不刺眼 |
| 悬浮面板 | `backdrop-blur(16px)` + 深色半透明 | 毛玻璃效果 |
| 装饰元素 | `var(--gradient-primary)` | 仅用于 logo、rank badge 等点缀 |

---

## 3. 字体方案

```css
:root {
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
}

.amount {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

| Token | 大小 | 字重 | 用途 |
|-------|------|------|------|
| text-hero | 32px | 700 | 首页大金额 |
| text-title | 22px | 600 | 页面标题 |
| text-card-title | 16px | 600 | 卡片标题 |
| text-body | 14px | 400 | 正文、表单标签 |
| text-small | 13px | 400 | 辅助说明、时间 |
| text-tiny | 11px | 500 | 标签、角标 |

---

## 4. 间距系统

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}
```

---

## 5. 核心页面设计

### 5.1 首页仪表盘

**布局结构**:
- 顶部导航栏（毛玻璃效果）
- 3列统计卡片（今日销售/今日采购/库存预警）
- 2列图表区（销售趋势 + 畅销排行）
- 最近单据列表
- 快捷操作网格

**设计细节**:
- 统计卡片: `bg-elevated`, 圆角10px, 金额使用纯色高亮
- 趋势图表: 紫蓝线条 + 渐变填充, Y轴网格线极淡
- 快捷操作按钮: 48px高度, 图标+文字纵向, 紫蓝背景

### 5.2 POS 销售开单页

**布局结构**:
- 顶部导航 + 操作按钮
- 扫码区域（大点击区域）
- 购物车商品列表
- 结算信息面板（固定底部）
- 确认收款大按钮

**设计细节**:
- 扫码区: 120px高, 虚线边框, 点击后紫蓝实线
- 商品卡片: 左侧图标(圆形), 右侧数量调节器
- 数量调节器: 40px圆形按钮, 中间数字加粗
- 确认收款按钮: 56px高, 纯色, 点击缩放动画

### 5.3 库存查询页

**布局结构**:
- 搜索栏
- 分类筛选标签
- 商品卡片列表（库存进度条）

**设计细节**:
- 库存进度条: 根据比例动态变色(绿/黄/红)
- 商品卡片: 库存紧张黄色脉冲, 缺货红色
- 分类筛选: pill形状, 选中状态 subtle 紫蓝背景 + 边框

---

## 6. 组件规范

### 6.1 按钮体系

| 类型 | 样式 | 用途 |
|------|------|------|
| Primary | `var(--accent-primary)`, 无边框 | 核心操作 |
| Secondary | `bg-surface`, `border-medium` | 次要操作 |
| Ghost | 透明, 悬停 `bg-hover` | 文字链接 |
| Danger | 红色背景/边框 | 删除作废 |
| Tab Active | `accent-subtle` + 紫蓝边框 | 标签页选中 |
| POS Grid | `bg-elevated`, 大圆角, 80x80网格 | 快捷商品 |

### 6.2 输入框

```css
.kimi-input {
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 14px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}
.kimi-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-subtle);
  outline: none;
}
```

### 6.3 数据表格

- 表头: text-secondary, font-weight: 500
- 行高: 52px
- 行悬停: bg-hover
- 选中行: 左侧2px紫蓝竖线 + subtle 背景

### 6.4 弹窗/抽屉

- 遮罩: rgba(0,0,0,0.6) + backdrop-blur(4px)
- 面板: bg-elevated, 底部抽屉圆角12px
- 动画: translateY(100%) → translateY(0), 250ms ease-out

---

## 7. 动效规范

### 7.1 页面过渡

```css
.page-enter {
  opacity: 0;
  transform: translateX(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 7.2 按钮交互

```css
.btn-primary {
  transition: all 0.15s;
}
.btn-primary:hover {
  background: var(--accent-hover);
}
.btn-primary:active {
  transform: scale(0.97);
}
```

### 7.3 特殊动效

- **库存预警脉冲**: @keyframes pulse-yellow
- **扫码成功**: 紫蓝对勾扩散动画
- **数字滚动**: requestAnimationFrame 递增

---

## 8. 打印样式（小票）

```css
@media print {
  .app-header, .nav-bar, .btn-group { display: none !important; }
  .receipt {
    width: 80mm;
    padding: 8px;
    font-family: monospace;
    font-size: 12px;
    color: #000;
    background: #fff;
  }
}
```

---

## 9. 主题切换

```html
<div class="theme-toggle">
  <span>🌙</span>
  <div class="toggle-switch" @click="toggleTheme">
    <div class="toggle-thumb" :class="{ active: isDark }"></div>
  </div>
  <span>☀️</span>
</div>
```

切换方式: `document.documentElement.setAttribute('data-theme', 'light'/'dark')`

---

## 10. 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| Mobile | < 640px | 单列, POS全屏, 底部固定结算栏 |
| Tablet | 640-1024px | 双列, 侧边栏可收起 |
| Desktop | > 1024px | 三列, 左侧导航常驻 |

---

## 11. 设计原则（Linear 风格核心）

1. **深色优先**: 默认 #0C0C0C，多层深色背景区分层级
2. **边框精确**: 使用 1px hairline border，rgba(255,255,255,0.06) 起步
3. **色彩克制**: 强调色仅用于交互元素，大面积保持中性
4. **无过度装饰**: 避免大阴影、强发光、过度动画
5. **高对比度文字**: 白色主文字，灰色层级递减
6. **紧凑间距**: 12px-16px 为常用间距，不浪费空间
7. **圆角克制**: 6px-10px，避免过大圆角
