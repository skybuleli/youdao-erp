# Kimi ERP UI Design Specification

> **有道食品经销存管理系统** - 视觉设计规范 v1.0
> **设计风格**: Kimi AI 科技风（深色默认 + 可切换浅色）
> **品牌渐变**: 紫色 #8B5CF6 → 粉色 #EC4899

---

## 1. 设计概述

**设计哲学**: 将 Kimi AI 的未来科技感与进销存的业务效率结合，打造一套"看起来像 AI 智能系统"的经销商管理工具。

**核心关键词**: 智能 · 高效 · 精致 · 未来感

**适用场景**: 食品/日用品行业进销存管理，支持 PC 网页端 + Android 移动端

---

## 2. 色彩系统

### 2.1 CSS 变量

```css
/* 深色模式（默认） */
:root {
  --bg-base: #0A0A0F;
  --bg-elevated: #13131F;
  --bg-surface: #1C1C2E;
  --bg-hover: #252538;

  --gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  --gradient-subtle: linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.15) 100%);
  --gradient-glow: linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.4) 100%);

  --text-primary: #F8F8FC;
  --text-secondary: #A1A1B5;
  --text-tertiary: #6B6B80;

  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;

  --border-subtle: rgba(255,255,255,0.06);
  --border-medium: rgba(255,255,255,0.1);

  --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
  --shadow-glow-purple: 0 0 20px rgba(139,92,246,0.3);
  --shadow-glow-pink: 0 0 20px rgba(236,72,153,0.3);
}

/* 浅色模式 */
[data-theme="light"] {
  --bg-base: #F5F5FA;
  --bg-elevated: #FFFFFF;
  --bg-surface: #F0F0F5;
  --bg-hover: #E8E8F0;

  --gradient-primary: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%);
  --gradient-subtle: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(219,39,119,0.08) 100%);

  --text-primary: #111118;
  --text-secondary: #4B4B5E;
  --text-tertiary: #9CA3AF;

  --border-subtle: rgba(0,0,0,0.06);
  --border-medium: rgba(0,0,0,0.1);

  --shadow-card: 0 4px 24px rgba(0,0,0,0.08);
  --shadow-glow-purple: 0 0 20px rgba(124,58,237,0.15);
  --shadow-glow-pink: 0 0 20px rgba(219,39,119,0.15);
}
```

### 2.2 色彩使用规则

| 场景 | 颜色 | 效果 |
|------|------|------|
| 品牌按钮 | `var(--gradient-primary)` | 紫→粉渐变，悬停发光 |
| 数据统计高亮 | `#8B5CF6` 或渐变色文字 | 大数字使用渐变填充 |
| 库存预警 | `#F59E0B` + 脉冲动画 | 黄色呼吸灯效果 |
| 库存缺货 | `#EF4444` + 红色发光 | 红色光晕提示 |
| 库存正常 | `#10B981` | 纯绿色，无发光 |
| 选中状态 | 半透明紫色背景 + 紫色左边框 | 清晰但不刺眼 |
| 悬浮面板 | `backdrop-blur(12px)` + 半透明背景 | 毛玻璃效果 |

---

## 3. 字体方案

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'Outfit', 'Noto Sans SC', sans-serif;
  --font-body: 'Noto Sans SC', -apple-system, sans-serif;
}

.amount {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

| Token | 大小 | 字重 | 用途 |
|-------|------|------|------|
| text-hero | 36px | 700 | 首页大金额 |
| text-title | 24px | 600 | 页面标题 |
| text-card-title | 18px | 600 | 卡片标题 |
| text-body | 15px | 400 | 正文、表单标签 |
| text-small | 13px | 400 | 辅助说明、时间 |
| text-tiny | 11px | 500 | 标签、角标 |

---

## 4. 间距系统

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
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
- 统计卡片: `bg-elevated`, 圆角16px, 金额使用渐变色文字
- 趋势图表: 紫色线条 + 渐变填充, Y轴网格线极淡
- 快捷操作按钮: 48px高度, 图标+文字纵向, 紫色背景悬停发光

### 5.2 POS 销售开单页

**布局结构**:
- 顶部导航 + 操作按钮
- 扫码区域（大点击区域）
- 购物车商品列表
- 结算信息面板（固定底部）
- 确认收款大按钮

**设计细节**:
- 扫码区: 120px高, 虚线边框, 点击后紫色实线+发光
- 商品卡片: 左侧图标(圆形渐变), 右侧数量调节器
- 数量调节器: 40px圆形按钮, 中间数字加粗
- 确认收款按钮: 56px高, 渐变+发光, 点击缩放动画

### 5.3 库存查询页

**布局结构**:
- 搜索栏
- 分类筛选标签
- 商品卡片列表（库存进度条）

**设计细节**:
- 库存进度条: 根据比例动态变色(绿/黄/红)
- 商品卡片: 库存紧张黄色脉冲, 缺货红色发光
- 分类筛选: pill形状, 选中状态渐变

---

## 6. 组件规范

### 6.1 按钮体系

| 类型 | 样式 | 用途 |
|------|------|------|
| Primary | gradient-primary, shadow-glow-purple | 核心操作 |
| Secondary | bg-surface, border-medium | 次要操作 |
| Ghost | 透明, 悬停bg-hover | 文字链接 |
| Danger | 红色背景/边框 | 删除作废 |
| POS Grid | bg-elevated, 大圆角, 80x80网格 | 快捷商品 |

### 6.2 输入框

```css
.kimi-input {
  height: 48px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 16px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.2s;
}
.kimi-input:focus {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
  outline: none;
}
```

### 6.3 数据表格

- 表头: text-secondary, font-weight: 500
- 行高: 56px
- 行悬停: bg-hover
- 选中行: 左侧3px紫色竖线 + 渐变背景

### 6.4 弹窗/抽屉

- 遮罩: rgba(0,0,0,0.6) + backdrop-blur(4px)
- 面板: bg-elevated, 底部抽屉圆角20px
- 动画: translateY(100%) → translateY(0), 300ms ease-out

---

## 7. 动效规范

### 7.1 页面过渡

```css
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}
.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 7.2 按钮交互

```css
.btn-primary {
  transition: all 0.2s;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow-purple);
}
.btn-primary:active {
  transform: scale(0.97);
}
```

### 7.3 特殊动效

- **库存预警脉冲**: @keyframes pulse-yellow
- **扫码成功**: 紫色对勾扩散动画
- **收款成功**: 紫色 confetti 粒子效果
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
