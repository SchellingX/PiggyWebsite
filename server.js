import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const MEDIA_DIR = path.join(__dirname, 'media'); // Mount point for docker volume
const DIST_DIR = path.join(__dirname, 'dist');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure media directory exists (if not mounted)
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Helper to read DB
const readDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    return null;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return null;
  }
};

// Helper to write DB
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing DB:", err);
    return false;
  }
};

// --- API Routes ---

// Get Data
app.get('/api/data', (req, res) => {
  const data = readDb();
  if (data) {
    res.json(data);
  } else {
    // If no data exists, return empty object (frontend will handle initialization)
    res.json({ initialized: false });
  }
});

// Save Data
app.post('/api/data', (req, res) => {
  const success = writeDb(req.body);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// --- Static Files ---

// Serve Mounted Media Files
app.use('/media', express.static(MEDIA_DIR));

// Serve Frontend Build
app.use(express.static(DIST_DIR));

// SPA Fallback: Serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🐷 Pig Family Hub Server running on port ${PORT}`);
  console.log(`📁 Data Directory: ${DATA_DIR}`);
  console.log(`📁 Media Mount: ${MEDIA_DIR}`);
});