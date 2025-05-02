const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Note = require('../models/Note');

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create Note
router.post('/', auth, [
  body('title').isLength({ min: 1 }),
  body('content').isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const note = new Note({ user: req.user.id, title: req.body.title, content: req.body.content });
    await note.save();
    res.status(201).json(note);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Read Notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Note
router.put('/:id', auth, [
  body('title').optional().isLength({ min: 1 }),
  body('content').optional().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
