# 🐷 猪一家 (Pig Family Hub)

> 一个温馨、现代且功能强大的家庭综合门户网站，专为“猪猪家庭”打造。

![Project Banner](/public/assets/slide1.jpg)

## 📖 项目简介

**猪一家** 是一个集家庭博客、相册管理、生活应用和 AI 智能助手于一体的单页应用 (SPA)。它采用苹果风格的极简设计，配色温暖（琥珀黄），旨在记录家庭生活点滴，提供便捷的信息管理工具，并增强家庭成员间的互动。

本项目完全容器化，支持本地存储挂载，数据隐私可控，且集成了 Google Gemini AI 提供智能搜索服务。

---

## ✨ 核心功能

### 1. 📝 家庭博客
- **所见即所得**：支持 Markdown 语法，可直接插入图片。
- **互动功能**：家庭成员可以点赞、收藏和评论文章。
- **自动归档**：所有博客文章不仅保存在数据库中，还会自动生成 `.md` 文件归档到服务器后端，方便备份和二次阅读。
- **草稿箱**：支持自动保存草稿，防止灵感丢失。

### 2. 📷 智能相册
- **多媒体支持**：不仅支持照片，还支持视频播放（完美适配 iPhone Live Photo 导出的视频）。
- **挂载导入**：支持从服务器本地目录 (`/media`) 直接挂载大量照片/视频，无需通过浏览器一一上传。
- **大图浏览**：沉浸式 Lightbox 体验，支持点赞、评论和收藏回忆。

### 3. 🧠 AI 全能搜索
- **双模引擎**：支持“站内搜索”（查找博客、照片、应用）和“AI 助手”（基于 Google Gemini 模型）。
- **自然语言**：可以像和家人聊天一样询问 AI，获取食谱、讲故事或查询信息。

### 4. 🛠 生活工具箱
- **应用仪表盘**：快速访问家庭常用服务。
- **提醒事项**：极简的待办事项清单，未完成的事项会自动同步到主页的“家庭公告栏”。

### 5. 🔐 权限体系
- **角色管理**：猪管（管理员）、普通成员、访客（猪迷）。
- **精细控制**：管理员可调整主页布局、管理所有内容；普通成员可发布/编辑自己的内容；访客仅拥有只读权限。

---

## 🛠 技术实现

本项目采用了现代化的前后端分离架构（但在部署时合并为一个服务）：

*   **前端**：React 18, TypeScript, Vite, Tailwind CSS (UI), Lucide React (图标)。
*   **后端**：Node.js (Express)。负责托管静态资源、API 接口响应以及文件读写操作。
*   **数据存储**：
    *   核心数据：基于 JSON 的轻量级文件数据库 (`db.json`)。
    *   博客归档：自动生成 Markdown 文件。
    *   媒体文件：本地文件系统存储。
*   **AI 服务**：集成 Google Gemini API (`gemini-3-pro-preview`)。
*   **容器化**：Docker 多阶段构建 (Multi-stage Build)。

---

## 🚀 部署指南

### 前置条件
*   服务器安装了 Docker 和 Docker Compose。
*   拥有一个 Google Gemini API Key。

### 1. Docker 快速启动

直接运行以下命令即可启动容器：

```bash
docker run -d \
  --name pig-family-hub \
  -p 8080:80 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/media:/app/media \
  -e API_KEY="your_google_gemini_api_key_here" \
  pig-family-hub:latest
```

**参数说明：**
*   `-p 8080:80`: 将容器的 80 端口映射到主机的 8080 端口。
*   `-v .../data:/app/data`: **重要**。持久化保存数据库和博客 Markdown 文件。
*   `-v .../media:/app/media`: **重要**。挂载本地媒体目录，放入此目录的照片/视频可在相册中通过“挂载导入”添加。
*   `-e API_KEY`: 设置构建时和运行时需要的 Gemini API 密钥。

### 2. 构建镜像 (如果你想自己编译)

```bash
# 注意：API_KEY 在构建阶段也需要（用于注入前端），运行时也需要（用于后端兜底或扩展）
docker build --build-arg API_KEY=your_key_here -t pig-family-hub .
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

## 🗺 路线图 (Roadmap)

*   [ ] **多语言支持**：增加英语界面切换。
*   [ ] **视频转码**：目前依赖浏览器原生解码，未来计划增加后端 FFmpeg 转码以支持更多格式。
*   [ ] **用户动态流**：记录“谁在什么时候看了什么”。
*   [ ] **私密空间**：为每位成员增加需要单独密码访问的私密板块。
*   [ ] **移动端 APP**：基于 PWA 或 React Native 开发独立客户端。

---

## ⚠️ 已知问题与注意事项

1.  **浏览器兼容性**：相册中的视频播放依赖浏览器原生支持。部分旧版浏览器可能无法播放 `.mov` (HEVC) 格式视频。推荐使用 Chrome, Edge 或 Safari 最新版。
2.  **并发写入**：后端使用 JSON 文件作为数据库。虽然对于家庭场景（<10人）完全够用，但在极高并发写入下可能存在锁冲突风险。
3.  **上传限制**：前端直传图片/视频采用 Base64 编码存入 JSON（为了简化架构），这会导致 `db.json` 体积迅速膨胀。**强烈建议视频和大图通过 `/media` 挂载目录导入**，仅将小图或封面图通过前端上传。

---

## ❤️ 致谢

本项目“本猪窝”是在 **Google Gemini** 模型的协助下，由一位充满爱的“猪管”搭建完成。

Enjoy your family time! 🐷
