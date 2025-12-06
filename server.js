
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

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
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DIST_DIR = path.join(__dirname, 'dist');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

  // Find or create admin user and ensure password is correct
  let adminUser = data.allUsers.find(u => u.role === 'admin' && u.id === 'u_admin');
  if (adminUser) {
    // For demo purposes, reset password on every server start
    adminUser.password = '123456';
  } else {
    // If no admin, create one
    adminUser = {
      id: 'u_admin',
      name: '猪管',
      avatar: '/assets/avatar-default.jpg',
      role: 'admin',
      password: '123456',
    };
    data.allUsers.unshift(adminUser); // Add to the beginning
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
  }

  // Ensure other family members exist
  const familyMembers = [
    { id: 'u_dad', name: '爸比', role: 'member' },
    { id: 'u_mom', name: '妈咪', role: 'member' },
    { id: 'u_grandma', name: '婆婆', role: 'member' }
  ];

  familyMembers.forEach(member => {
    let user = data.allUsers.find(u => u.id === member.id);
    if (user) {
      // Reset password for demo
      user.password = '123456';
    } else {
      user = {
        ...member,
        avatar: '/assets/avatar-default.jpg',
        password: '123456'
      };
      data.allUsers.push(user);
    }
  });

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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
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

  if (!name || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = users.find(u => u.name === name);

  if (user && user.password === password) {
    const { password, ...userToReturn } = user;
    return res.json(userToReturn);
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


// --- Fallback for old /api/data, now deprecated ---
app.get('/api/data', (req, res) => {
  const db = readDb();
  res.json({
    apps: db.apps || [],
    blogs: db.blogs || [],
    photos: db.photos || [],
    reminders: db.reminders || [],
    allUsers: db.allUsers || [],
    siteTheme: db.siteTheme || {},
    homeSections: db.homeSections || []
  });
});

app.post('/api/data', (req, res) => {
  res.status(410).json({ error: "This endpoint is deprecated. Please use the new granular API endpoints." });
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

// --- Server Start ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
