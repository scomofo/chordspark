const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3456;

app.use(cors());
app.use(express.json());

// List songs (with optional search and sort)
app.get('/api/songs', (req, res) => {
  const { q, sort } = req.query;
  let sql = 'SELECT * FROM songs';
  const params = [];

  if (q) {
    sql += ' WHERE title LIKE ? OR artist LIKE ?';
    params.push('%' + q + '%', '%' + q + '%');
  }

  if (sort === 'newest') {
    sql += ' ORDER BY created_at DESC';
  } else {
    sql += ' ORDER BY votes DESC, created_at DESC';
  }

  sql += ' LIMIT 50';

  const songs = db.prepare(sql).all(...params);
  res.json(songs);
});

// Get single song
app.get('/api/songs/:id', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  res.json(song);
});

// Submit a new song
app.post('/api/songs', (req, res) => {
  const { title, artist, chords, progression, pattern, bpm, level, submitted_by } = req.body;

  if (!title || !artist || !chords || !progression) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = db.prepare(`
    INSERT INTO songs (title, artist, chords, progression, pattern, bpm, level, submitted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title, artist, chords, progression,
    pattern || '["D","D","U","U","D","U"]',
    bpm || 100, level || 1,
    submitted_by || 'Anonymous'
  );

  res.json({ id: result.lastInsertRowid, message: 'Song submitted!' });
});

// Upvote a song
app.post('/api/songs/:id/vote', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  db.prepare('UPDATE songs SET votes = votes + 1 WHERE id = ?').run(req.params.id);
  res.json({ votes: song.votes + 1 });
});

// Search songs
app.get('/api/songs/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const songs = db.prepare(
    'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? ORDER BY votes DESC LIMIT 20'
  ).all('%' + q + '%', '%' + q + '%');

  res.json(songs);
});

app.listen(PORT, () => {
  console.log('ChordSpark Community Server running on http://localhost:' + PORT);
});
