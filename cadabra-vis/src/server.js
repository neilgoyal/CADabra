const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Define the path to your code file
const codeFilePath = path.join(__dirname, 'assets', 'my-file.kcl');

// Endpoint to fetch the code
app.get('/api/codefile', (req, res) => {
  fs.readFile(codeFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading code file:', err);
      return res.status(500).json({ error: 'Failed to read code file' });
    }
    // Return file content and specify the custom language
    res.json({ code: data, language: 'kittyCad' });
  });
});

// Endpoint to save the code
app.post('/api/codefile', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  fs.writeFile(codeFilePath, code, 'utf8', (err) => {
    if (err) {
      console.error('Error saving code file:', err);
      return res.status(500).json({ error: 'Failed to save code file' });
    }
    res.json({ message: 'Code saved successfully' });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
