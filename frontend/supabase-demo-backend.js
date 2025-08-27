// supabase-demo-backend.js
// Minimal Node.js Express API with Supabase integration
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Example: Create a new user (insert into 'users' table)
app.post('/api/users', async (req, res) => {
  const { username, email } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data[0] });
});

// Example: Get all users
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ users: data });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Supabase demo backend running on http://localhost:${PORT}`);
});
