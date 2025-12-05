# 🔐 安全政策与最佳实践

## 安全信息披露

如果发现安全漏洞，请发送邮件至项目维护者，而不是在公开问题中披露。

---

## 已实现的安全措施

### 1. 网络层安全

- **CORS 配置限制**：不允许所有来源跨域请求
  ```javascript
  const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  };
  ```

- **HTTPS 反向代理**：所有生产环境必须通过 Nginx + SSL 访问
- **请求体大小限制**：50MB 限制防止资源耗尽
- **目录遍历防护**：媒体路径验证防止 `..` 攻击

### 2. API 安全

- **请求验证**：所有 POST 请求验证请求体格式
- **健康检查端点**：`/health` 提供服务状态监控
- **全局错误处理**：避免敏感信息在错误消息中泄露
- **API Key 验证**：Gemini 服务验证 API Key 有效性

### 3. 认证与授权

- **基于角色的访问控制 (RBAC)**：
  - 管理员 (admin)：全部权限
  - 成员 (member)：创建和编辑自己的内容
  - 访客 (guest)：只读权限

- **客户端权限检查**：
  ```tsx
  if (user?.role === 'guest') {
    console.warn("访客无权修改密码");
    return;
  }
  ```

### 4. 数据安全

- **本地数据存储**：数据完全在本地控制，不上传第三方服务器
- **文件操作安全**：
  - 文件名清洗：移除非法字符
  - 目录创建权限验证
  - 错误处理和日志记录

### 5. 应用监控

- **优雅关闭处理**：
  ```javascript
  process.on('SIGTERM', () => {
    console.log('开始优雅关闭...');
    server.close(() => process.exit(0));
  });
  ```

- **日志记录**：所有关键操作记录到控制台/日志
- **健康检查**：Docker 内建健康检查机制

---

## 生产环境安全检查清单

### 前置审查（部署前）

- [ ] **更改默认密码** `demo@piggy.home` 为强密码
  ```typescript
  // 在 constants.ts 中修改
  const DEFAULT_DEMO_PASSWORD = 'your_strong_password_here';
  ```

- [ ] **配置 API Key**
  ```bash
  export API_KEY="your_actual_gemini_api_key"
  ```

- [ ] **配置允许的来源**
  ```bash
  export ALLOWED_ORIGINS="https://family.example.com"
  ```

- [ ] **启用 HTTPS**
  - 申请有效的 SSL 证书（推荐 Let's Encrypt）
  - 配置 Nginx 反向代理
  - 强制 HTTPS 重定向

- [ ] **设置防火墙规则**
  - 只允许必要端口 (80, 443) 对外
  - 限制 SSH 访问 IP 范围

- [ ] **备份策略**
  ```bash
  # 定期备份数据
  0 2 * * * tar -czf /backups/piggy-$(date +\%Y\%m\%d).tar.gz /data /media
  ```

### 运行时安全

- [ ] **监控容器日志**
  ```bash
  docker logs -f pig-family-hub
  ```

- [ ] **定期更新依赖**
  ```bash
  npm audit
  npm update
  docker build --no-cache .
  ```

- [ ] **启用审计日志**
  添加更详细的日志记录：
  ```javascript
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
  ```

- [ ] **速率限制**（Nginx 配置）
  ```nginx
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  location /api {
    limit_req zone=api burst=20 nodelay;
  }
  ```

### 网络安全

- [ ] **配置 Nginx 安全头**
  ```nginx
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  ```

- [ ] **启用 HSTS**
  ```nginx
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  ```

- [ ] **隐藏服务器信息**
  ```nginx
  server_tokens off;
  ```

---

## 已知安全限制与缓解方案

### 1. 密码明文存储

**风险**：当前版本以明文形式存储密码

**缓解**：
- ✅ 仅用于家庭网络（本地部署）
- ✅ 不在公网暴露
- 🔄 生产版本应实现 bcrypt 密码哈希：

```javascript
import bcrypt from 'bcrypt';

// 注册时
const hashedPassword = await bcrypt.hash(password, 10);

// 验证时
const isMatch = await bcrypt.compare(password, user.hashedPassword);
```

### 2. JSON 数据库并发限制

**风险**：高并发下文件写入可能产生冲突

**缓解**：
- ✅ 实现写入队列机制
- ✅ 限制并发连接数
- 🔄 迁移至 MongoDB/PostgreSQL：

```javascript
// 简单的写入队列
const writeQueue = [];
let isWriting = false;

async function queuedWrite(data) {
  writeQueue.push(data);
  if (!isWriting) {
    isWriting = true;
    while (writeQueue.length > 0) {
      const data = writeQueue.shift();
      await writeDb(data);
    }
    isWriting = false;
  }
}
```

### 3. 大文件 Base64 编码

**风险**：图片/视频 Base64 编码导致 JSON 体积膨胀

**缓解**：
- ✅ 强烈建议使用 `/media` 挂载目录上传大文件
- 🔄 实现分块上传接口：

```javascript
app.post('/api/upload', upload.single('file'), (req, res) => {
  // 保存文件到 /media 目录
  // 返回文件路径而非 Base64
  res.json({ url: `/media/${req.file.filename}` });
});
```

### 4. API Key 暴露

**风险**：Gemini API Key 在源代码中可见

**缓解**：
- ✅ 通过环境变量传递
- ✅ Vite 构建时自动注入
- ✅ 不在 git 历史中提交
- 🔄 使用密钥管理服务（AWS Secrets Manager、HashiCorp Vault 等）

---

## 依赖安全审计

定期运行：

```bash
# 检查已知漏洞
npm audit

# 修复可自动修复的漏洞
npm audit fix

# 检查过期依赖
npm outdated

# 更新所有依赖到最新版本
npm update
```

### 当前依赖版本

- `react@^18.2.0` ✅ 最新稳定版
- `typescript@^5.2.2` ✅ 最新版本
- `vite@^5.0.0` ✅ 最新版本
- `express@^4.18.2` ✅ 最新版本
- `@google/genai@^0.1.1` ⚠️ 检查是否有更新

---

## 事件响应与恢复

### 发现漏洞时的处理流程

1. **确认**：重现问题并评估严重程度
2. **隔离**：如有必要，停止受影响的服务
3. **修复**：部署安全补丁
4. **验证**：确认修复有效
5. **通知**：告知受影响的用户
6. **记录**：记录事件详情和应对措施

### 数据恢复

```bash
# 从备份恢复
tar -xzf /backups/piggy-20250104.tar.gz -C /

# 验证数据完整性
ls -la /data
ls -la /media
```

---

## 相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js 安全最佳实践](https://nodejs.org/en/docs/guides/nodejs-security/)
- [Express 安全最佳实践](https://expressjs.com/en/advanced/best-practice-security.html)
- [React 安全指南](https://react.dev/learn)

---

## 更新日志

### v1.0.0 (2025-12-04)

- ✅ 实现完整的错误处理
- ✅ 添加 CORS 配置限制
- ✅ 实现路径验证防止目录遍历
- ✅ 添加 API Key 验证
- ✅ 实现优雅关闭机制
- ✅ 完善文档和安全指南

---

**最后更新**：2025年12月4日
