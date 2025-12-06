# 🚀 PiggyWebsite Deployment Guide (部署指南)

本文档旨在指导用户从 GitHub 拉取代码、配置环境、使用 Docker 部署，并设置 Nginx 反向代理以通过域名访问。

---

## 🏗️ 1. 环境准备 (Prerequisites)

确保您的服务器已安装以下软件：
*   **Git**: 用于拉取代码。
*   **Docker** & **Docker Compose**: 用于运行应用。

### 安装 Docker (以 Ubuntu 为例)
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
# 添加 Docker 官方 GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 设置 repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 📥 2. 获取代码 (Get Code)

```bash
# 1. 克隆仓库
git clone https://github.com/SchellingX/PiggyWebsite.git

# 2. 进入目录
cd PiggyWebsite
```

---

## ⚙️ 3. 配置 & 启动 (Configure & Run)

### A. 快速启动 (Docker Compose)
项目已包含优化好的 `docker-compose.yml`，可直接一键启动。

```bash
# 构建并后台运行
docker compose up -d --build
```

启动后，访问 `http://localhost:8080` (或服务器IP:8080) 即可看到应用。

### B. 持久化数据
系统会自动在项目目录下生成 `data/` 和 `media/` 目录用于保存数据（如博客、照片、用户配置）。
*   `data/db.json`: 核心数据库文件。
*   `media/`: 存放上传的图片/视频。

---

## 🌐 4. 域名访问与 HTTPS (Nginx Proxy)

为了更安全、方便地访问，建议使用 Nginx 进行反向代理并配置 SSL 证书。

### Nginx 配置示例

编辑 Nginx 配置文件 (例如 `/etc/nginx/sites-available/piggy.conf`):

```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为您的域名

    # 强制重定向 HTTPS (可选，需配置SSL后生效)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://127.0.0.1:8080; # 转发到 Docker 端口
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启用 HTTPS (使用 Certbot)

```bash
# 安装 Python Certbot
sudo apt install certbot python3-certbot-nginx

# 自动生成证书并更新 Nginx 配置
sudo certbot --nginx -d your-domain.com
```

---

## 🛠️ 5. 常见维护操作

### 更新代码
```bash
git pull origin main
docker compose up -d --build
```

### 查看日志
```bash
docker compose logs -f
```

### 备份数据
定期备份 `data/` 和 `media/` 目录即可。

```bash
tar -czvf piggy-backup-$(date +%F).tar.gz data/ media/
```

---

**🎉 部署完成！享受您的 Piggy Family Hub 吧！**
