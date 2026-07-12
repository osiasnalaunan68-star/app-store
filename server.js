const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (index.html, images, etc.)
app.use(express.static(__dirname));

const COMMENTS_FILE = path.join(__dirname, 'comments.json');
if (!fs.existsSync(COMMENTS_FILE)) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify([]));
}

// API routes
app.get('/api/comments', (req, res) => {
  try {
    const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read comments' });
  }
});

app.post('/api/comments', (req, res) => {
  try {
    const newComment = req.body;
    if (!newComment.text || !newComment.name || !newComment.color) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
    const comments = JSON.parse(data);

    if (!newComment.id) {
      newComment.id = Date.now();
      newComment.replies = newComment.replies || [];
      comments.push(newComment);
    } else {
      const parent = comments.find(c => c.id === newComment.parentId);
      if (!parent) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
      parent.replies.push({
        name: newComment.name,
        color: newComment.color,
        text: newComment.text
      });
    }

    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
