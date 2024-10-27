const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Middleware to parse JSON

// POST endpoint to save file content
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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
