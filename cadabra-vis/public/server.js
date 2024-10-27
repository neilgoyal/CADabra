// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to list .glb files in assets folder
app.get('/files', (req, res) => {
  const absolutePath = path.join(__dirname, 'assets', );
  fs.readdir(absolutePath, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list files' });
    const glbFiles = files.filter(file => path.extname(file) === '.glb');
    res.json({ files: glbFiles });
  });
});

app.post('/save-file', (req, res) => {
  const { filePath, content } = req.body;

  // Resolve to an absolute path within the server's public directory
  const absolutePath = path.join(__dirname, '', filePath);

  fs.writeFile(absolutePath, content, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).json({ error: 'Failed to save file' });
    }
    res.json({ message: 'File saved successfully' });
  });
});

app.listen(4000, () => {
  console.log('Server running on port 4000');
});
