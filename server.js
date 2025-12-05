import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';

// --- 基础配置 ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run 默认注入 PORT 环境变量，通常为 8080
const PORT = parseInt(process.env.PORT) || 8080;

// --- 中间件配置 ---

// CORS 配置：仅在必要时允许跨域，避免过度开放
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// 增加请求体大小限制，以支持 Base64 图片上传
app.use(bodyParser.json({ limit: '50mb' })); 

// --- 目录路径定义 ---

const DATA_DIR = path.join(__dirname, 'data');
const POSTS_DIR = path.join(DATA_DIR, 'posts'); // 存放生成的 Markdown 博客文件
const DB_FILE = path.join(DATA_DIR, 'db.json'); // 核心 JSON 数据库
const MEDIA_DIR = path.join(__dirname, 'media'); // 媒体文件挂载目录
const DIST_DIR = path.join(__dirname, 'dist'); // 前端静态资源目录

// --- 初始化检查 ---
// 确保所有必要的目录都存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// --- 辅助函数 ---

// 读取数据库
const readDb = () => {
  if (!fs.existsSync(DB_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error("读取数据库失败:", err);
    return null;
  }
};

// 写入数据库
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    
    // 如果包含博客数据，同时也将其保存为 Markdown 文件
    if (data.blogs && Array.isArray(data.blogs)) {
      setTimeout(() => saveBlogsAsMarkdown(data.blogs), 0); // 异步执行防止阻塞
    }
    
    return true;
  } catch (err) {
    console.error("写入数据库失败:", err);
    return false;
  }
};

// 文件名清洗，防止非法字符
const sanitizeFilename = (name) => {
  // 仅保留字母、数字、中文和下划线
  return name.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_').toLowerCase();
};

// 将博客保存为 Markdown 文件
const saveBlogsAsMarkdown = (blogs) => {
  blogs.forEach(blog => {
    try {
      const filename = `${sanitizeFilename(blog.title)}_${blog.id}.md`;
      const filePath = path.join(POSTS_DIR, filename);
      
      // 构建 Frontmatter 元数据
      const fileContent = `---
title: ${blog.title}
author: ${blog.author.name}
date: ${blog.date}
tags: ${blog.tags.join(', ')}
likes: ${blog.likes}
---

${blog.content}
`;
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      console.error(`保存博客 Markdown 失败: ${blog.id}`, e);
    }
  });
};

// --- API 路由 ---

// 健康检查端点 (Cloud Run 推荐)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取全站数据
app.get('/api/data', (req, res) => {
  try {
    const data = readDb();
    if (data) {
      res.json(data);
    } else {
      // 如果没有数据，返回标记让前端初始化
      res.json({ initialized: false });
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存全站数据
app.post('/api/data', (req, res) => {
  try {
    // 验证请求体
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: '无效的请求体' });
    }
    
    const success = writeDb(req.body);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: '保存数据失败' });
    }
  } catch (error) {
    console.error('保存数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// --- 静态资源托管 ---

// 挂载 /media 路径，用于访问 Docker 卷中的文件
app.use('/media', (req, res, next) => {
  // 验证文件路径，防止目录遍历攻击
  const sanitizedPath = path.normalize(req.path);
  if (sanitizedPath.includes('..')) {
    return res.status(403).json({ error: '访问被拒绝' });
  }
  next();
}, express.static(MEDIA_DIR));

// 托管 React 前端构建产物
app.use(express.static(DIST_DIR));

// SPA 路由回退：所有未匹配的请求都返回 index.html
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: '应用未构建，请先运行 npm run build' });
  }
});

// --- 启动服务器 ---

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 关键修改：必须显式绑定 '0.0.0.0'，否则在 Docker 容器中无法被外部访问
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 猪一家服务器启动成功`);
  console.log(`📡 监听地址: http://0.0.0.0:${PORT}`);
  console.log(`📁 数据目录: ${DATA_DIR}`);
  console.log(`🎬 前端资源: ${DIST_DIR}`);
  console.log(`🖼️  媒体挂载: ${MEDIA_DIR}`);
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});