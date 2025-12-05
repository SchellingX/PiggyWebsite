# 多阶段构建：第一阶段 - 构建前端
FROM node:20-alpine AS builder

WORKDIR /app

# 复制项目文件
COPY package.json package-lock.json* yarn.lock* ./
COPY tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
COPY public/ ./public/

# 构建参数 - API_KEY 在构建时注入
ARG API_KEY=default

# 安装依赖并构建前端
RUN npm ci && \
    API_KEY=$API_KEY npm run build

# --- 第二阶段 - 运行时环境 ---
FROM node:20-alpine

WORKDIR /app

# 安装生产依赖
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci --only=production

# 从 builder 阶段复制前端构建产物
COPY --from=builder /app/dist ./dist

# 复制后端代码
COPY server.js ./
COPY components/ ./components/
COPY context/ ./context/
COPY pages/ ./pages/
COPY services/ ./services/
COPY constants.ts types.ts ./

# 运行时环境变量 - 从构建参数传递
ARG API_KEY=default
ENV API_KEY=$API_KEY

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 启动应用
CMD ["node", "server.js"]
