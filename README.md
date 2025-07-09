# Vue3 响应式项目模板

一个主要适配 H5，同时在 PC 端也有良好体验的 Vue3 项目模板。

## 🚀 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vuetify 3** - Material Design 组件库
- **UnoCSS** - 即时原子化 CSS 引擎
- **TypeScript** - JavaScript 的超集
- **Vite** - 下一代前端构建工具
- **pnpm** - 快速、节省磁盘空间的包管理器

## 📱 响应式设计特性

### H5 优先设计
- 主要针对移动端优化
- 触摸友好的交互设计
- 移动端优化的字体大小和间距
- 防止页面缩放和横向滚动

### PC 端适配
- 桌面端有良好的视觉体验
- 合理的最大宽度限制
- 悬停效果和桌面端交互
- 响应式网格布局

### 断点设置
```
xs: 320px   (小屏手机)
sm: 375px   (标准手机)
md: 768px   (平板)
lg: 1024px  (小桌面)
xl: 1280px  (大桌面)
2xl: 1536px (超大桌面)
```

## 🎨 主色调

项目使用 `#1F2937` 作为主色调，这是一个深灰蓝色，既现代又专业。

## 🛠️ 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 类型检查
pnpm type-check

# 代码检查和修复
pnpm lint
```

## 📁 项目结构

```
src/
├── components/          # 组件
│   ├── ResponsiveLayout.vue  # 响应式布局组件
│   └── DemoCard.vue     # 示例卡片组件
├── views/              # 页面
│   ├── HomeView.vue    # 首页
│   ├── AboutView.vue   # 关于页面
│   └── ResponsiveDemo.vue # 响应式演示页面
├── plugins/            # 插件配置
│   └── vuetify.ts      # Vuetify 配置
├── router/             # 路由配置
└── assets/             # 静态资源
```

## 🎯 UnoCSS 工具类

项目提供了一系列响应式工具类：

### 容器类
- `container-responsive` - 响应式容器
- `container-mobile` - 移动端容器
- `container-desktop` - 桌面端容器

### 间距类
- `safe-area-mobile` - 移动端安全区域
- `safe-area-all` - 全设备安全区域
- `gap-responsive` - 响应式间距

### 文字类
- `text-responsive-title` - 响应式标题
- `text-responsive-subtitle` - 响应式副标题
- `text-responsive-body` - 响应式正文

## 🌟 特性展示

1. **响应式网格** - 在不同设备上自动调整列数
2. **自适应字体** - 根据屏幕大小调整字体大小
3. **触摸优化** - 移动端友好的按钮和交互
4. **桌面端增强** - PC 端的悬停效果和更大的点击区域
5. **主题一致性** - 统一的颜色主题和设计语言

## 📖 使用说明

### 响应式布局组件

```vue
<template>
  <ResponsiveLayout max-width="desktop" padding="responsive">
    <template #default="{ device }">
      <div v-if="device.isMobile">移动端内容</div>
      <div v-else>桌面端内容</div>
    </template>
  </ResponsiveLayout>
</template>
```

### UnoCSS 响应式类

```vue
<template>
  <div class="container-responsive safe-area-all">
    <h1 class="text-responsive-title">响应式标题</h1>
    <p class="text-responsive-body">响应式内容</p>
  </div>
</template>
```

## 🔧 自定义配置

### 修改主色调

在 `uno.config.ts` 和 `src/plugins/vuetify.ts` 中修改主色调。

### 调整断点

在相应配置文件中调整断点设置。

## 💻 IDE 推荐

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 📄 许可证

MIT License
