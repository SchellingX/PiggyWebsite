# 🐷 猪一家 (Pig Family Hub)

> 一个温馨、现代且功能强大的家庭综合门户网站，专为"猪猪家庭"打造。

![Project Banner](/public/assets/slide1.jpg)

## 📖 项目简介

**猪一家** 是一个集家庭博客、相册管理、生活应用和 AI 智能助手于一体的单页应用 (SPA)。它采用苹果风格的极简设计，配色温暖（琥珀黄），旨在记录家庭生活点滴，提供便捷的信息管理工具，并增强家庭成员间的互动。

本项目完全容器化，支持本地存储挂载，数据隐私可控，且集成了 Google Gemini AI 提供智能搜索服务。

### 💡 核心价值
- **隐私优先**：数据存储在本地，完全掌控在自己手中
- **功能完整**：集博客、相册、应用、搜索于一体，满足家庭需求
- **易于部署**：Docker 一键启动，开箱即用
- **充满温度**：温暖的设计风格，AI 助手具有家庭感知能力
- **生产就绪**：完整的错误处理、安全验证和优雅关闭机制

---
# 🐷 猪一家 (Pig Family Hub)

一个面向家庭的轻量型门户：博客、相册、工具和 AI 助手的集合。

此仓库包含前端（React + Vite）和后端（Express）的代码，并提供了 Docker + Docker Compose 配置用于一键部署。

**本次迭代的主要变更**
- 将前端对 Google Gemini SDK 的直接依赖移至后端代理：前端现在调用 `/api/ai`，后端在运行时再动态加载 `@google/genai`（若配置了 `API_KEY`）。
- 改进了 `server.js` 的错误处理、CORS 配置和静态文件安全检查。
- 更新并现代化了 `docker-compose.yml`、`Dockerfile`，并提供示例 `.env`（本地测试）。
- 修复了若干 TypeScript 空值访问问题，并在严格模式下通过构建。

## 快速开始（本地 - 使用 Docker Compose）

1. 复制示例环境文件并修改：

```bash
cp .env.example .env
# 编辑 .env，将 API_KEY 替换为你的 Google Gemini Key（若不使用 AI，可保留 default）
```

2. 使用 Docker Compose 启动（推荐使用 Docker Compose v2，即 `docker compose`）：

```bash
docker compose up --build -d

# 查看日志
docker compose logs -f pig-family-hub

# 停止并移除
docker compose down
```

3. 访问应用：打开 `http://localhost:8080`。

注意：本地 `.env` 包含敏感信息，请不要将它推送到远程仓库（仓库已在 `.gitignore` 中忽略 `.env`）。

## AI 功能说明
- 前端通过 `services/geminiService.ts` 调用后端代理 `POST /api/ai`。
- 后端在运行时会尝试动态加载 `@google/genai` 并向 Gemini 发起请求（前提是运行环境已配置 `API_KEY` 并且包可用）。
- 若未配置 `API_KEY` 或 SDK 无法加载，后端会返回友好提示，前端将展示“AI 未配置”的消息。

示例请求（前端已封装，通常不需要手动调用）：

```http
POST /api/ai
Content-Type: application/json

{ "query": "帮我写一道晚餐食谱，适合一家四口" }
```

## 安全与运维建议
- 强烈建议在生产环境使用 Secrets（Kubernetes secret / Docker secrets / CI secrets）来管理 `API_KEY`，不要直接在仓库中存放密钥。
- 生产部署时使用反向代理（Nginx、Traefik）并配置 HTTPS（Let's Encrypt）。
- 检查容器或宿主机上 `data/` 与 `media/` 目录的权限，确保只有信任用户可读写。

## 开发与调试
- 本地开发（不通过 Docker）：安装依赖并启动前端开发服务器

```bash
npm install
npm run dev
```

- 后端本地运行：

```bash
node server.js
```

（在开发环境，`.env` 可设置 `NODE_ENV=development`。）

## 已知事项与后续改进
- `@google/genai` 被设为可选：如果需要在构建时打包 SDK，可将其恢复为常规依赖并确保版本可用。
- 建议逐步强化 TypeScript 类型校验（当前已恢复 `strict: true`），并在 CI 中加入 lint 与 typecheck。
- 可以在 CI 中添加自动构建并推送镜像到私有 Registry 的 workflow（需要密钥）。

## 联系与贡献
- 有修复或改进建议请发起 PR 或在 issue 中描述复现步骤与日志。

---

感谢使用 “猪一家”！如果你希望我把这些改动提交并推送到仓库（我将推送到 `main` 分支），我可以继续操作。 
*   `-v .../media:/app/media`: **重要**。挂载本地媒体目录，放入此目录的照片/视频可在相册中通过"挂载导入"添加。
*   `-e API_KEY`: 设置 Gemini API 密钥（必需）。

### 2. 使用 Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  pig-family-hub:
    build:
      context: .
      args:
        API_KEY: ${API_KEY}
    image: pig-family-hub:latest
    container_name: pig-family-hub
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data           # 数据库持久化
      - ./media:/app/media         # 媒体文件挂载
    environment:
      - PORT=8080
      - API_KEY=${API_KEY}
      - ALLOWED_ORIGINS=http://localhost:8080,https://family.example.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

启动服务：

```bash
export API_KEY="your_google_gemini_api_key_here"
docker-compose up -d
```

### 3. 构建镜像 (如果你想自己编译)

```bash
# 注意：API_KEY 需要在构建时传递
docker build \
  --build-arg API_KEY=your_key_here \
  -t pig-family-hub:latest .
```

### 4. 从源代码本地开发

#### 安装依赖
```bash
npm install
```

#### 开发服务器
```bash
# 启动前端开发服务器（热重载）
npm run dev

# 在另一个终端启动后端
export API_KEY="your_google_gemini_api_key_here"
npm start
```

#### 构建生产版本
```bash
npm run build      # 构建前端
npm start          # 启动后端
```

---

## 🔒 反向代理与 SSL (HTTPS) 配置

为了安全起见，建议不要直接暴露 HTTP 端口，而是使用 Nginx 进行反向代理并配置 HTTPS。

### Nginx 配置示例

假设你有一个域名 `family.example.com`，且 Docker 运行在本地 `8080` 端口。

```nginx
server {
    listen 80;
    server_name family.example.com;
    # 强制跳转 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name family.example.com;

    # SSL 证书配置 (推荐使用 Certbot / Let's Encrypt 生成)
    ssl_certificate /etc/letsencrypt/live/family.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/family.example.com/privkey.pem;

    # 推荐的 SSL 参数
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 代理设置
    location / {
        proxy_pass http://localhost:8080; # 指向 Docker 端口
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 获取真实 IP
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 允许上传大文件 (对应后端的 50mb 限制)
        client_max_body_size 50M;
    }
}
```

---

## 🔐 安全特性

### 已实现的安全措施

1. **目录遍历防护**：媒体访问路径验证，防止使用 `..` 进行目录遍历。
2. **请求体验证**：API 端点验证请求数据的有效性。
3. **CORS 配置**：限制跨域请求来源，可通过环境变量配置。
4. **API Key 验证**：Gemini 服务校验 API Key 是否正确配置。
5. **错误处理**：全局错误处理中间件，避免敏感信息泄露。
6. **优雅关闭**：支持 SIGTERM 和 SIGINT 信号的优雅关闭。
7. **文件名清洗**：Markdown 导出时清洗文件名，防止特殊字符注入。

### 生产环境建议

1. **生产密码**：使用强密码替代 `demo@piggy.home`，生产环境应使用哈希存储。
2. **HTTPS**：必须使用 HTTPS，并配置有效的 SSL 证书（如 Let's Encrypt）。
3. **数据库升级**：建议迁移至 MongoDB 或 PostgreSQL 等专业数据库以支持更高的并发。
4. **备份策略**：定期备份 `/data` 和 `/media` 目录。
5. **速率限制**：在 Nginx 配置中添加速率限制，防止暴力破解。
6. **日志监控**：启用应用日志和容器日志监控。

---

## 📝 开发文档

### 添加新页面

1. 在 `pages/` 目录创建新组件，例如 `NewPage.tsx`
2. 在 `App.tsx` 中添加路由：
   ```tsx
   <Route path="/newpage" element={<NewPage />} />
   ```
3. 在 `Navbar.tsx` 中添加导航链接

### 扩展数据模型

修改 `types.ts` 定义新的数据结构，然后在 `context/DataContext.tsx` 中添加对应的操作方法。

### 调用 AI 服务

```tsx
import { askGemini } from '../services/geminiService';

const response = await askGemini("你的问题");
```

---

## 🗺 路线图 (Roadmap)

*   [ ] **多语言支持**：增加英语界面切换。
*   [ ] **视频转码**：目前依赖浏览器原生解码，未来计划增加后端 FFmpeg 转码以支持更多格式。
*   [ ] **用户动态流**：记录"谁在什么时候看了什么"。
*   [ ] **私密空间**：为每位成员增加需要单独密码访问的私密板块。
*   [ ] **移动端 APP**：基于 PWA 或 React Native 开发独立客户端。
*   [ ] **数据库迁移**：升级至 MongoDB 或 PostgreSQL。
*   [ ] **全文搜索**：集成 Elasticsearch 提升搜索性能。

---

## ⚠️ 已知问题与注意事项

1.  **浏览器兼容性**：相册中的视频播放依赖浏览器原生支持。部分旧版浏览器可能无法播放 `.mov` (HEVC) 格式视频。推荐使用 Chrome, Edge 或 Safari 最新版。
2.  **并发写入**：后端使用 JSON 文件作为数据库。虽然对于家庭场景（<10人）完全够用，但在极高并发写入下可能存在锁冲突风险。
3.  **上传限制**：前端直传图片/视频采用 Base64 编码存入 JSON（为了简化架构），这会导致 `db.json` 体积迅速膨胀。**强烈建议视频和大图通过 `/media` 挂载目录导入**，仅将小图或封面图通过前端上传。
4. **密码存储**：当前版本以明文形式存储密码（仅限演示和家庭网络使用）。**不要在公网暴露此应用**，生产环境必须实现密码哈希。

---

## 🐛 问题排查

### 容器无法启动

```bash
# 查看容器日志
docker logs pig-family-hub

# 进入容器调试
docker exec -it pig-family-hub /bin/sh
```

### 前端无法加载

- 确保 `npm run build` 已成功执行
- 检查 `dist/` 目录是否存在
- 清除浏览器缓存

### AI 功能不工作

- 验证 `API_KEY` 环境变量是否正确设置
- 检查 Gemini API Key 的有效性
- 查看浏览器控制台是否有错误信息

### 数据保存失败

- 检查 `/data` 卷挂载是否正确
- 验证容器对 `/data` 目录的写权限
- 查看服务器日志中的错误信息

---

## 💻 本地环境变量配置

在根目录创建 `.env` 文件（仅用于开发）：

```
API_KEY=your_google_gemini_api_key_here
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

---

## ❤️ 致谢

本项目"猪一家"是在 **Google Gemini** 模型的协助下，由一位充满爱的"猪管"搭建完成。

感谢开源社区提供的优秀工具和库：React, TypeScript, Vite, Express, Tailwind CSS, Lucide React 等。

Enjoy your family time! 🐷

---

## 📄 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

---

**最后更新**：2025年12月4日
**版本**：1.0.0（生产就绪）
