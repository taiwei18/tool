# 部署指南

## Vercel 部署

本项目已配置为可以直接部署到 Vercel 平台。

### 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 上导入项目
3. Vercel 会自动检测配置并部署

### 手动部署

1. 安装 Vercel CLI（已包含在项目中）：
   ```bash
   pnpm install
   ```

2. 登录 Vercel：
   ```bash
   npx vercel login
   ```

3. 部署到预览环境：
   ```bash
   pnpm run deploy:preview
   ```

4. 部署到生产环境：
   ```bash
   pnpm run deploy
   ```

### 环境配置

项目使用以下环境变量：

- `VITE_API_BASE_URL`: API 基础地址（生产环境：https://tool-ruddy.vercel.app/api）
- `VITE_API_TIMEOUT`: API 超时时间（默认：30000ms）
- `VITE_APP_TITLE`: 应用标题
- `VITE_APP_DESCRIPTION`: 应用描述
- `VITE_APP_VERSION`: 应用版本

### 构建命令

- 开发环境：`pnpm dev`
- 生产构建：`pnpm build:prod`
- 预览构建：`pnpm preview`
- 类型检查：`pnpm type-check`

### 部署配置

项目包含以下配置文件：

- `vercel.json`: Vercel 部署配置
- `.env.production`: 生产环境变量
- `.env.development`: 开发环境变量

### API 地址

- 生产环境：https://tool-ruddy.vercel.app/api
- 开发环境：http://localhost:3000/api

### 注意事项

1. 确保 API 服务器支持 CORS
2. 生产环境会自动移除 console.log
3. 静态资源会被缓存 1 年
4. 支持 PWA 功能
