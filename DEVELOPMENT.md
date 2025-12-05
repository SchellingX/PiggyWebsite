# 🛠️ 开发指南

本文档为想要为猪一家项目做贡献或进行本地开发的开发者服务。

---

## 📋 前置条件

- Node.js >= 16.x
- npm >= 8.x
- Docker & Docker Compose（可选，用于容器化测试）
- Git

---

## 🚀 本地开发启动

### 1. 克隆项目

```bash
git clone https://github.com/SchellingX/PiggyWebsite.git
cd PiggyWebsite
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件（Git 会自动忽略）：

```env
API_KEY=your_google_gemini_api_key_here
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
NODE_ENV=development
```

### 4. 启动开发服务器

**终端 1 - 启动前端开发服务器（支持热重载）**

```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动（Vite 默认端口）

**终端 2 - 启动后端服务器**

```bash
export API_KEY="your_key_here"
npm start
```

后端将在 `http://localhost:8080` 启动

### 5. 访问应用

打开浏览器访问 `http://localhost:8080`（后端 + 前端代理）或 `http://localhost:5173`（Vite 开发模式）

---

## 📁 项目结构详解

```
PiggyWebsite/
├── components/
│   ├── Footer.tsx              # 页脚组件
│   ├── HomeCarousel.tsx        # 首页轮播图
│   └── Navbar.tsx              # 导航栏（包含用户菜单）
├── pages/
│   ├── Home.tsx                # 首页
│   ├── Blog.tsx                # 博客页面
│   ├── Gallery.tsx             # 相册页面
│   ├── Apps.tsx                # 应用仪表盘
│   ├── Search.tsx              # 搜索页面
│   └── Login.tsx               # 登录页面
├── services/
│   └── geminiService.ts        # AI 服务层
├── context/
│   └── DataContext.tsx         # 全局状态管理（Redux 替代方案）
├── App.tsx                     # 主应用组件（路由定义）
├── index.tsx                   # React 入口点
├── types.ts                    # TypeScript 类型定义
├── constants.ts                # 常量和 Mock 数据
├── server.js                   # Express 后端服务
├── vite.config.ts              # Vite 构建配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 依赖管理
├── Dockerfile                  # 容器镜像配置
├── docker-compose.yml          # 容器编排（可选）
├── .env.local                  # 本地环境变量（Git 忽略）
└── README.md                   # 项目文档
```

---

## 🏗️ 核心架构

### 数据流

```
User Input
    ↓
React Component
    ↓
useData() Hook (Context)
    ↓
DataContext State
    ↓
API Call (fetch /api/data)
    ↓
Express Backend
    ↓
File System (db.json, /media)
```

### 认证流程

```
Login Form
    ↓
login(name, password)
    ↓
Find user in allUsers array
    ↓
Set user state
    ↓
Redirect to Home
    ↓
Protected routes check user state
```

---

## 💡 常见开发任务

### 添加新页面

1. **创建页面组件**

```tsx
// pages/Timeline.tsx
import React from 'react';
import { useData } from '../context/DataContext';

const Timeline: React.FC = () => {
  const { blogs } = useData();
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">时间线</h1>
      {/* 页面内容 */}
    </div>
  );
};

export default Timeline;
```

2. **添加路由**

在 `App.tsx` 中：

```tsx
import Timeline from './pages/Timeline';

// 在 Routes 中添加
<Route path="/timeline" element={<Timeline />} />
```

3. **添加导航链接**

在 `components/Navbar.tsx` 中的菜单列表添加新链接

### 添加新数据类型

1. **定义类型**

在 `types.ts` 中：

```typescript
export interface TimelineEntry {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}
```

2. **添加 Mock 数据**

在 `constants.ts` 中：

```typescript
export const MOCK_TIMELINE: TimelineEntry[] = [
  {
    id: 't1',
    title: '家庭成立',
    date: '2020-01-01',
    description: '我们的故事开始...'
  }
];
```

3. **扩展 Context**

在 `context/DataContext.tsx` 中：

```typescript
// 添加状态
const [timeline, setTimeline] = useState<TimelineEntry[]>(MOCK_TIMELINE);

// 添加 action
const addTimelineEntry = (entry: TimelineEntry) => {
  setTimeline(prev => [...prev, entry]);
};

// 暴露在 Provider value 中
```

### 调用 AI 服务

```tsx
import { askGemini } from '../services/geminiService';

const handleAIQuery = async () => {
  const response = await askGemini('你的问题');
  console.log(response);
};
```

---

## 🎨 样式指南

项目使用 **Tailwind CSS** 进行样式化。

### 颜色方案

- **主色**：琥珀黄 (`amber-*`)
- **背景**：浅米色 (`slate-*`)
- **强调色**：蓝色 (`blue-*`)、绿色 (`green-*`)

### 常用类名模式

```tsx
// 容器
<div className="max-w-7xl mx-auto px-4 py-8">

// 文本
<h1 className="text-3xl font-bold text-slate-800">

// 按钮
<button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-semibold transition-colors">

// 卡片
<div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
```

---

## 🧪 测试

### 单元测试（待实现）

```bash
npm run test
```

### 集成测试

手动测试清单：

- [ ] 用户可以登录
- [ ] 用户可以创建博客
- [ ] 用户可以上传照片
- [ ] 搜索功能工作正常
- [ ] AI 回应查询
- [ ] 数据保存到后端
- [ ] 响应式设计在移动端正常

### 性能测试

```bash
# 构建生产版本
npm run build

# 检查构建体积
npm run build -- --analyze

# 使用 Lighthouse 审计
# 在 Chrome DevTools 中打开 Lighthouse 标签
```

---

## 🐛 调试

### 前端调试

1. **Chrome DevTools**
   - F12 打开开发者工具
   - Sources 标签设置断点
   - Console 标签查看日志

2. **React DevTools 扩展**
   - 在 Chrome 应用商店安装
   - Inspector 标签查看组件树
   - Profiler 标签分析性能

3. **VS Code 调试**

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMapPathOverride": {
        "webpack:///./src/*": "${workspaceFolder}/src/*"
      }
    }
  ]
}
```

### 后端调试

```bash
# 启用 Node 调试模式
node --inspect server.js

# 在 Chrome 访问 chrome://inspect
```

### 日志记录

```typescript
// 前端日志
console.log('[AppName]', 'Message', data);

// 后端日志
console.log(`[${new Date().toISOString()}] Message`);

// 错误日志
console.error('Operation failed:', error);
```

---

## 📦 构建与部署

### 本地构建

```bash
# 清理旧构建
rm -rf dist

# 构建前端
npm run build

# 验证构建产物
ls -la dist/

# 启动后端（会自动服务 dist 中的文件）
npm start
```

### Docker 构建

```bash
# 开发版本
docker build -t pig-family-hub:dev .

# 指定 API Key
docker build \
  --build-arg API_KEY=your_key_here \
  -t pig-family-hub:latest .

# 启动容器
docker run -d \
  -p 8080:8080 \
  -e API_KEY=your_key_here \
  pig-family-hub:latest
```

---

## 🔄 Git 工作流

### 分支命名规范

- `main` - 生产分支
- `develop` - 开发主分支
- `feature/描述` - 功能分支
- `bugfix/描述` - 修复分支
- `hotfix/描述` - 紧急修复

### 提交信息规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 样式（不影响代码逻辑）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

**Examples:**
```
feat(blog): 添加博客发布功能
fix(gallery): 修复视频播放问题
docs(readme): 更新部署指南
```

---

## 📚 推荐资源

### 官方文档

- [React 官方文档](https://react.dev)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Express.js 指南](https://expressjs.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vite 文档](https://vitejs.dev/)

### 学习资源

- [React 最佳实践](https://react.dev/learn)
- [TypeScript 深入浅出](https://www.typescriptlang.org/docs/handbook/)
- [Node.js 官方指南](https://nodejs.org/en/docs/)

### 工具

- [VS Code](https://code.visualstudio.com/) - 推荐编辑器
- [Prettier](https://prettier.io/) - 代码格式化
- [ESLint](https://eslint.org/) - 代码质量检查

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

在提交前：
- 运行 `npm run build` 确保构建成功
- 检查 TypeScript 类型是否正确
- 更新相关文档

---

## ❓ 常见问题

### Q: 如何修改默认密码？

A: 在 `constants.ts` 中修改 `DEFAULT_DEMO_PASSWORD` 变量。

### Q: 如何添加新用户？

A: 在 `ALL_USERS` 数组中添加新的 User 对象，或使用 UI 中的"添加用户"功能。

### Q: 如何处理 API Key 过期？

A: 在 docker-compose.yml 或启动命令中更新 `API_KEY` 环境变量。

### Q: 如何解决样式编译错误？

A: 确保 Tailwind CSS 配置正确，运行 `npm run dev` 重新编译。

---

**最后更新**：2025年12月4日
