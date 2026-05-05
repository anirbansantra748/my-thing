import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Schemas
const CanvasSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  kind: String,
  title: String,
  cover: String,
  background: String,
  width: Number,
  height: Number,
  items: Array,
  createdAt: Number,
  updatedAt: Number
});

const JournalSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  text: String,
  mood: String,
  updatedAt: Number
});

const MovieSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  year: String,
  rating: Number,
  status: String,
  cover: String,
  notes: String,
  createdAt: Number,
  updatedAt: Number
});

const BookSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  author: String,
  pagesRead: Number,
  totalPages: Number,
  rating: Number,
  status: String,
  cover: String,
  notes: String,
  createdAt: Number,
  updatedAt: Number
});

const SketchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  elements: Array,
  appState: Object,
  files: Object,
  cover: String,
  createdAt: Number,
  updatedAt: Number
});

const SongSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  artist: String,
  url: String,
  cover: String,
  notes: String,
  rating: Number,
  album: String,
  genre: String,
  mood: String,
  createdAt: Number,
  updatedAt: Number
});

const Canvas = mongoose.models.Canvas || mongoose.model('Canvas', CanvasSchema);
const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
const Sketch = mongoose.models.Sketch || mongoose.model('Sketch', SketchSchema);
const Song = mongoose.models.Song || mongoose.model('Song', SongSchema);

// Helper to handle generic CRUD
const setupCRUD = (route, Model, idField = 'id') => {
  app.get(`/api/${route}`, async (req, res) => {
    try {
      const items = await Model.find();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(`/api/${route}`, async (req, res) => {
    try {
      const id = req.body[idField];
      const item = await Model.findOneAndUpdate(
        { [idField]: id },
        req.body,
        { upsert: true, new: true }
      );
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(`/api/${route}/:id`, async (req, res) => {
    try {
      await Model.findOneAndDelete({ [idField]: req.params.id });
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

export default app;
