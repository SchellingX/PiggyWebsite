
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Basic Config ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT) || 8080;

// --- Middleware ---

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));

// --- Paths & Init ---

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DIST_DIR = path.join(__dirname, 'dist');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk || mimeOk);
  }
});

// --- DB Helper Functions ---

// Read the entire database
const readDb = () => {
  let data;
  if (!fs.existsSync(DB_FILE)) {
    // If DB doesn't exist, create it with a default structure
    data = {
      allUsers: [],
      blogs: [],
      photos: [],
      reminders: [],
      siteTheme: {},
      homeSections: []
    };
  } else {
    try {
      data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
      console.error("Failed to read or parse database, re-initializing:", err);
      data = { allUsers: [], blogs: [], photos: [], reminders: [], siteTheme: {}, homeSections: [] };
    }
  }

  // Ensure data has allUsers array
  if (!data.allUsers) {
    data.allUsers = [];
  }

  // Find or create admin user
  let adminUser = data.allUsers.find(u => u.role === 'admin' && u.id === 'u_admin');
  if (adminUser) {
    // Ensure name is 'admin' and password is '123456'
    if (adminUser.name !== 'admin') adminUser.name = 'admin';
    if (adminUser.password !== '123456') adminUser.password = '123456';
    if (adminUser.avatar !== '/assets/avatar-admin.jpg') adminUser.avatar = '/assets/avatar-admin.jpg';
  } else {
    adminUser = {
      id: 'u_admin',
      name: 'admin',
      avatar: '/assets/avatar-admin.jpg',
      role: 'admin',
      password: '123456',
    };
    data.allUsers.unshift(adminUser);
  }

  // Find or create guest user
  let guestUser = data.allUsers.find(u => u.role === 'guest');
  if (!guestUser) {
    guestUser = {
      id: 'u_guest',
      name: '猪迷',
      avatar: '/assets/avatar-guest.jpg',
      role: 'guest',
      password: '',
    };
    data.allUsers.push(guestUser);
  } else {
    // Ensure guest avatar is correct if changed
    if (guestUser.avatar !== '/assets/avatar-guest.jpg') guestUser.avatar = '/assets/avatar-guest.jpg';
    if (guestUser.name !== '猪迷') guestUser.name = '猪迷';
  }

  // Ensure family members exist
  const familyMembers = [
    { id: 'u_dad', name: 'daddy', role: 'member', avatar: '/assets/avatar-daddy.jpeg' },
    { id: 'u_mom', name: 'mommy', role: 'member', avatar: '/assets/avatar-mommy.jpeg' },
    { id: 'u_nanny', name: 'nanny', role: 'member', avatar: '/assets/avatar-nanny.jpeg' }
  ];

  familyMembers.forEach(member => {
    let user = data.allUsers.find(u => u.id === member.id);
    if (user) {
      // Enforce empty password, correct name and avatar
      user.password = '';
      user.name = member.name;
      user.avatar = member.avatar;
    } else {
      user = {
        ...member,
        password: ''
      };
      data.allUsers.push(user);
    }
  });

  // Remove old 'grandma' if she is not 'nanny' (u_grandma vs u_nanny). 
  // If u_grandma exists and we want to "rename" her to nanny, we might duplicates if we just push u_nanny.
  // 'u_grandma' was in previous code. I'll just leave it or filter it out if strictly following "accounts are...".
  // For safety, I'll filter out u_grandma if I'm adding u_nanny, or just let them be. 
  // The clean way is to keep db clean.
  // I will filter out users that are not in our defined list to be safe, OR just add/update. 
  // I'll stick to adding/updating.

  // Save changes back to the file
  writeDb(data);

  return data;
};

// Write the entire database
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Failed to write database:", err);
    return false;
  }
};

// --- API Routes ---

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Upload API ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// --- Auth API ---
app.post('/api/auth/login', (req, res) => {
  const { name, password, guest } = req.body;
  const db = readDb();
  const users = db.allUsers || [];

  if (guest) {
    const guestUser = users.find(u => u.role === 'guest');
    if (guestUser) {
      const { password, ...userToReturn } = guestUser;
      return res.json(userToReturn);
    }
    return res.status(404).json({ error: 'Guest user definition not found.' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  // Password needed only for admin? Or strict check?
  // Logic: find user by name. Check password.
  const user = users.find(u => u.name === name);

  if (user) {
    // If user requires password (admin), check it.
    // If user has empty password, check that provided password is empty (or just ignore it?)
    // We will strict check: user.password === password (even if both are empty strings).
    if (user.password === password || (user.password === '' && !password)) {
      const { password, ...userToReturn } = user;
      return res.json(userToReturn);
    }
  }

  res.status(401).json({ error: 'Invalid credentials.' });
});

// --- User Management API ---
app.post('/api/users', (req, res) => {
  const db = readDb();
  const { name, avatar, password } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });

  const newUser = {
    id: `u_${uuidv4()}`,
    name,
    avatar: avatar || '/assets/avatar-default.png',
    role: 'member',
    password: password || '',
  };
  db.allUsers.push(newUser);
  writeDb(db);
  const { password: _p, ...userToReturn } = newUser;
  res.status(201).json(userToReturn);
});

app.put('/api/users/:id/avatar', (req, res) => {
  const { id } = req.params;
  const { avatar } = req.body;
  if (!avatar) return res.status(400).json({ error: 'Avatar URL is required.' });

  const db = readDb();
  const user = db.allUsers.find(u => u.id === id);
  if (user) {
    user.avatar = avatar;
    writeDb(db);
    const { password, ...userToReturn } = user;
    res.json(userToReturn);
  } else {
    res.status(404).json({ error: 'User not found.' });
  }
});

app.put('/api/users/:id/password', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (typeof newPassword !== 'string') return res.status(400).json({ error: 'New password is required.' });

  const db = readDb();
  const user = db.allUsers.find(u => u.id === id);
  if (user) {
    user.password = newPassword;
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found.' });
  }
});

// --- Blogs API ---
app.get('/api/blogs', (req, res) => {
  const db = readDb();
  res.json(db.blogs || []);
});

app.post('/api/blogs', (req, res) => {
  const db = readDb();
  const newBlog = { ...req.body, id: uuidv4(), comments: [], likes: 0, isCollected: false, date: new Date().toISOString() };
  db.blogs.unshift(newBlog);
  writeDb(db);
  res.status(201).json(newBlog);
});

app.put('/api/blogs/:id', (req, res) => {
  const { id } = req.params;
  const updatedBlogData = req.body;
  const db = readDb();
  const index = db.blogs.findIndex(b => b.id === id);
  if (index > -1) {
    db.blogs[index] = { ...db.blogs[index], ...updatedBlogData };
    writeDb(db);
    res.json(db.blogs[index]);
  } else {
    res.status(404).json({ error: 'Blog not found.' });
  }
});

app.delete('/api/blogs/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.blogs = db.blogs.filter(b => b.id !== id);
  writeDb(db);
  res.status(204).send();
});

app.post('/api/blogs/:id/like', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const blog = db.blogs.find(b => b.id === id);
  if (blog) {
    blog.likes = (blog.likes || 0) + 1;
    writeDb(db);
    res.json({ id: blog.id, likes: blog.likes });
  } else {
    res.status(404).json({ error: 'Blog not found.' });
  }
});

app.post('/api/blogs/:id/collect', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const blog = db.blogs.find(b => b.id === id);
  if (blog) {
    blog.isCollected = !blog.isCollected;
    writeDb(db);
    res.json({ id: blog.id, isCollected: blog.isCollected });
  } else {
    res.status(404).json({ error: 'Blog not found.' });
  }
});

app.post('/api/blogs/:id/comment', (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'Author and text are required.' });
  const db = readDb();
  const blog = db.blogs.find(b => b.id === id);
  if (blog) {
    const newComment = { id: `c_${uuidv4()}`, author, text, date: new Date().toISOString() };
    if (!blog.comments) blog.comments = [];
    blog.comments.push(newComment);
    writeDb(db);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ error: 'Blog not found.' });
  }
});

// --- Photos API ---
app.get('/api/photos', (req, res) => {
  const db = readDb();
  res.json(db.photos || []);
});

app.post('/api/photos', (req, res) => {
  const db = readDb();
  const newPhoto = { ...req.body, id: uuidv4(), comments: [], likes: 0, isCollected: false, date: new Date().toISOString() };
  db.photos.unshift(newPhoto);
  writeDb(db);
  res.status(201).json(newPhoto);
});

app.post('/api/photos/:id/like', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const photo = db.photos.find(p => p.id === id);
  if (photo) {
    photo.likes = (photo.likes || 0) + 1;
    writeDb(db);
    res.json({ id: photo.id, likes: photo.likes });
  } else {
    res.status(404).json({ error: 'Photo not found.' });
  }
});

app.post('/api/photos/:id/collect', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const photo = db.photos.find(p => p.id === id);
  if (photo) {
    photo.isCollected = !photo.isCollected;
    writeDb(db);
    res.json({ id: photo.id, isCollected: photo.isCollected });
  } else {
    res.status(404).json({ error: 'Photo not found.' });
  }
});

app.post('/api/photos/:id/comment', (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'Author and text are required.' });
  const db = readDb();
  const photo = db.photos.find(p => p.id === id);
  if (photo) {
    const newComment = { id: `pc_${uuidv4()}`, author, text, date: new Date().toISOString() };
    if (!photo.comments) photo.comments = [];
    photo.comments.push(newComment);
    writeDb(db);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ error: 'Photo not found.' });
  }
});


// --- Reminders API (Simplified) ---
app.get('/api/reminders', (req, res) => {
  const db = readDb();
  res.json(db.reminders || []);
});

app.post('/api/reminders', (req, res) => {
  const db = readDb();
  const newReminder = { ...req.body, id: uuidv4(), completed: false };
  db.reminders.push(newReminder);
  writeDb(db);
  res.status(201).json(newReminder);
});

app.put('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const db = readDb();
  const reminder = db.reminders.find(r => r.id === id);

  if (reminder) {
    reminder.completed = completed;
    writeDb(db);
    res.json(reminder);
  } else {
    res.status(404).json({ error: 'Reminder not found.' });
  }
});

app.delete('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.reminders = db.reminders.filter(r => r.id !== id);
  writeDb(db);
  res.status(204).send();
});

// --- Apps API ---
app.get('/api/apps', (req, res) => {
  const db = readDb();
  res.json(db.apps || []);
});

app.post('/api/apps', (req, res) => {
  const db = readDb();
  const { name, url, icon } = req.body;
  if (!name || !url || !icon) {
    return res.status(400).json({ error: 'Name, URL, and icon are required.' });
  }
  const newApp = { ...req.body, id: uuidv4(), category: 'custom', description: '' };
  if (!db.apps) {
    db.apps = [];
  }
  db.apps.push(newApp);
  writeDb(db);
  res.status(201).json(newApp);
});

// --- Site Theme API ---
app.put('/api/theme', (req, res) => {
  const db = readDb();
  if (!db) {
    return res.status(500).json({ error: 'Database not available.' });
  }
  db.siteTheme = { ...db.siteTheme, ...req.body };
  writeDb(db);
  res.json(db.siteTheme);
});





// --- Static assets and SPA fallback ---
app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // In dev mode, this helps remind user to build the app.
    res.status(404).send('<html><body><h1>App not built</h1><p>Please run `npm run build`</p></body></html>');
  }
});

// --- AI API ---
// --- Admin Asset Management ---

app.get('/api/admin/assets', (req, res) => {
  // In a real app, verify admin session here
  const assetsDir = path.join(__dirname, 'dist', 'assets'); // Production assets
  // fallback to public/assets for dev if dist doesn't exist or is empty? 
  // Actually, in this setup, we serve valid assets from /assets path.
  // The user wants to list "assets in assets". Be careful about paths.
  // Dockerfile copies them to /app/dist/assets (from build) or we might have them in /app/public/assets.
  // Let's check where they are really served from in production.
  // Usually Vite puts them in dist/assets.
  // However, the user said "assets 中的所有预设图片".
  // I will list files in public/assets (source) AND dist/assets (served) to be safe, 
  // but ultimately we interact with the files serving the site.

  // For simplicity in this containerized env where logic is simple:
  // We will assume `dist/assets` is where the app looks for them.
  // BUT, the user might be adding to `public/assets` in dev.
  // Let's try to list from the `public/assets` mapped volume or directory if possible,
  // otherwise fallback to `dist/assets`.

  // Actually, look at the code structure:
  // app.use(express.static(path.join(__dirname, 'dist')));
  // So /assets/... maps to dist/assets/...

  // BUT, if we want to "persist" changes (overwrite), we must modify the file being served.

  const targetDir = path.join(__dirname, 'dist', 'assets');

  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    res.json(files.map(f => `/assets/${f}`));
  } else {
    res.json([]);
  }
});

app.post('/api/admin/assets/replace', (req, res) => {
  // Mock Auth Check
  const { targetUrl, sourceUrl } = req.body; // e.g. /assets/background-main.jpg, /assets/new-bg.jpg

  // Simple validation
  if (!targetUrl || !sourceUrl) return res.status(400).json({ error: 'Missing params' });

  const fileName = path.basename(targetUrl);
  const sourceName = path.basename(sourceUrl);

  const assetsDir = path.join(__dirname, 'dist', 'assets');
  const targetPath = path.join(assetsDir, fileName);
  const sourcePath = path.join(assetsDir, sourceName);

  if (!fs.existsSync(targetPath) || !fs.existsSync(sourcePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    // 1. Backup target
    const timestamp = Date.now();
    const backupPath = `${targetPath}.bak_${timestamp}`;
    fs.copyFileSync(targetPath, backupPath);

    // 2. Overwrite target with source
    fs.copyFileSync(sourcePath, targetPath);

    res.json({ success: true, backup: path.basename(backupPath) });
  } catch (err) {
    console.error("Asset replace failed:", err);
    res.status(500).json({ error: 'Replacement failed' });
  }
});

// --- Admin Reminder Sync ---

app.post('/api/reminders/bind', (req, res) => {
  const { userId } = req.body;
  // Verify user is admin
  const db = readDb();
  const user = db.allUsers.find(u => u.id === userId);

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: '只有管理员可以绑定外部账户。' });
  }

  // Generate a mock token
  const token = `sync_token_${uuidv4()}`;
  res.json({ token });
});

app.post('/api/reminders/sync', (req, res) => {
  const { token } = req.body;
  if (!token || !token.startsWith('sync_token_')) {
    return res.status(401).json({ error: '无效的同步令牌' });
  }

  // Return "Cloud" tasks (Mocked)
  const cloudTasks = [
    { text: '[Cloud] 检查服务器日志', completed: false, source: 'cloud' },
    { text: '[Cloud] 域名续费 (2026)', completed: false, source: 'cloud' },
    { text: '[Outlook] 给奶奶打电话', completed: true, source: 'outlook' }
  ];

  // In a real app, we would merge these into DB. 
  // Here we just return them for the frontend to merge or display.
  // Let's actually save them to DB to persist "Sync" effect.
  const db = readDb();
  let changes = false;

  cloudTasks.forEach(task => {
    const exists = db.reminders.some(r => r.text === task.text);
    if (!exists) {
      db.reminders.push({
        id: uuidv4(),
        text: task.text,
        completed: task.completed,
        date: new Date().toISOString()
      });
      changes = true;
    }
  });

  if (changes) writeDb(db);

  res.json({ success: true, synced: cloudTasks.length });
});

// --- Chat History API (Per-User, Multi-Session) ---

// Get all sessions for a user
app.get('/api/chat/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();

  if (!db.chatSessions) {
    db.chatSessions = {};
  }

  const userSessions = db.chatSessions[userId] || { userId, sessions: [] };
  res.json(userSessions);
});

// Get a specific session
app.get('/api/chat/:userId/:sessionId', (req, res) => {
  const { userId, sessionId } = req.params;
  const db = readDb();

  if (!db.chatSessions || !db.chatSessions[userId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = db.chatSessions[userId].sessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

// Create new session or update existing session
app.post('/api/chat/:userId', (req, res) => {
  const { userId } = req.params;
  const { sessionId, messages, title } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const db = readDb();
  if (!db.chatSessions) {
    db.chatSessions = {};
  }

  if (!db.chatSessions[userId]) {
    db.chatSessions[userId] = { userId, sessions: [] };
  }

  const now = new Date().toISOString();
  let session;

  if (sessionId) {
    // Update existing session
    session = db.chatSessions[userId].sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = messages;
      session.updatedAt = now;
      if (title) session.title = title;
    }
  }

  if (!session) {
    // Create new session
    const autoTitle = messages.length > 0 && messages[0].text
      ? messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : '')
      : '新对话';

    session = {
      id: sessionId || `session_${uuidv4()}`,
      title: title || autoTitle,
      messages,
      createdAt: now,
      updatedAt: now
    };
    db.chatSessions[userId].sessions.unshift(session); // Add to beginning
  }

  writeDb(db);
  res.json(session);
});

// Delete a specific session or all sessions
app.delete('/api/chat/:userId', (req, res) => {
  const { userId } = req.params;
  const { sessionId } = req.query;
  const db = readDb();

  if (db.chatSessions && db.chatSessions[userId]) {
    if (sessionId) {
      // Delete specific session
      db.chatSessions[userId].sessions = db.chatSessions[userId].sessions.filter(s => s.id !== sessionId);
    } else {
      // Delete all sessions
      db.chatSessions[userId].sessions = [];
    }
    writeDb(db);
  }

  res.status(204).send();
});

// --- AI Endpoint ---
app.post('/api/ai', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'default' || apiKey === 'your_api_key_here') {
    return res.status(503).json({ error: 'AI Brain missing (API Key not configured).' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `你现在是“猪猪一家”网站的智慧伙伴，也是全家人的好朋友。
    设定：
    1. 你的语气要可爱、亲切，像一只聪明的小猪，多用“哼哼”、“本猪”等词。
    2. 你擅长回答关于生活、家庭、美食以及本网站功能的问题。
    3. 这是一个温馨的家庭网站，绝对禁止讨论政治、暴力或任何敏感话题。如果遇到这类问题，请委婉拒绝（例如：“哼哼，本猪只懂吃喝玩乐，不懂那些复杂的哦~”）。
    
    用户问题: ${query}
    
    请用简短、可爱的中文回答。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'AI failed to respond.' });
  }
});

// --- Server Start ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
