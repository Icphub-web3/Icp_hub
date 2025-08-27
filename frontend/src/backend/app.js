const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/auth', (req, res) => {
  const { address } = req.body;
  if (address) return res.status(200).json({ valid: true });
  res.status(400).json({ valid: false });
});

module.exports = app;
