import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config(); // Try default first (good for production/Render)
dotenv.config({ path: '../.env' }); // Fallback for local dev

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('FATAL: MONGODB_URI is not defined in environment variables.');
}

mongoose.connect(mongoURI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't crash, but log heavily
  });

// Root route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Number, default: Date.now }
});

const CanvasSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  kind: String,
  title: String,
  cover: String,
  background: String,
  width: Number,
  height: Number,
  items: Array,
  category: String,
  isPinned: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number
});
CanvasSchema.index({ id: 1, userId: 1 }, { unique: true });

const JournalSchema = new mongoose.Schema({
  date: { type: String, required: true },
  userId: { type: String, required: true },
  text: String,
  mood: String,
  images: [String],
  updatedAt: Number
});
JournalSchema.index({ date: 1, userId: 1 }, { unique: true });

const MovieSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: String,
  year: String,
  rating: Number,
  status: String,
  cover: String,
  notes: String,
  category: String,
  isMasterpiece: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number
});
MovieSchema.index({ id: 1, userId: 1 }, { unique: true });

const BookSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: String,
  author: String,
  pagesRead: Number,
  totalPages: Number,
  rating: Number,
  status: String,
  cover: String,
  notes: String,
  category: String,
  isMasterpiece: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number
});
BookSchema.index({ id: 1, userId: 1 }, { unique: true });

const SketchSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: String,
  elements: Array,
  appState: Object,
  files: Object,
  cover: String,
  category: String,
  isPinned: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number
});
SketchSchema.index({ id: 1, userId: 1 }, { unique: true });

const SongSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: String,
  artist: String,
  url: String,
  cover: String,
  notes: String,
  rating: Number,
  albumId: String,
  genre: String,
  mood: String,
  isMasterpiece: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number
});
SongSchema.index({ id: 1, userId: 1 }, { unique: true });

const AlbumSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: String,
  description: String,
  cover: String,
  createdAt: Number,
  updatedAt: Number
});
AlbumSchema.index({ id: 1, userId: 1 }, { unique: true });

const VaultSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: String,
  category: String,
  image: String,
  notes: String,
  isPinned: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number
});
VaultSchema.index({ id: 1, userId: 1 }, { unique: true });

const AnimeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'watching' }, // watching, completed, planned, dropped
  seasonsWatched: { type: Number, default: 0 },
  totalSeasons: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  cover: String,
  notes: String,
  season: String,
  year: String,
  isPinned: { type: Boolean, default: false },
  isMasterpiece: { type: Boolean, default: false },
  themeSongUrl: String,
  createdAt: Number,
  updatedAt: Number
});
AnimeSchema.index({ id: 1, userId: 1 }, { unique: true });

const PhotoSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  title: String,
  image: { type: String, required: true },
  moment: String,
  location: String,
  createdAt: Number,
  updatedAt: Number
});
PhotoSchema.index({ id: 1, userId: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Canvas = mongoose.model('Canvas', CanvasSchema);
const Journal = mongoose.model('Journal', JournalSchema);
const Movie = mongoose.model('Movie', MovieSchema);
const Book = mongoose.model('Book', BookSchema);
const Sketch = mongoose.model('Sketch', SketchSchema);
const Song = mongoose.model('Song', SongSchema);
const Album = mongoose.model('Album', AlbumSchema);
const Vault = mongoose.model('Vault', VaultSchema);
const Photo = mongoose.model('Photo', PhotoSchema);
const Anime = mongoose.model('Anime', AnimeSchema);

// Auth Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to handle generic CRUD with userId
const setupCRUD = (route, Model, idField = 'id') => {
  app.get(`/api/${route}`, async (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const items = await Model.find({ userId });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(`/api/${route}`, async (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const id = req.body[idField];
      const item = await Model.findOneAndUpdate(
        { [idField]: id, userId },
        { ...req.body, userId },
        { upsert: true, new: true }
      );
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(`/api/${route}/:id`, async (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      await Model.findOneAndDelete({ [idField]: req.params.id, userId });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

setupCRUD('canvases', Canvas);
setupCRUD('journal', Journal, 'date');
setupCRUD('movies', Movie);
setupCRUD('books', Book);
setupCRUD('sketches', Sketch);
setupCRUD('songs', Song);
setupCRUD('albums', Album);
setupCRUD('vault', Vault);
setupCRUD('photos', Photo);
setupCRUD('anime', Anime);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
