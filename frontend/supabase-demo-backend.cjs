// supabase-demo-backend.cjs
// Minimal Node.js Express API with Supabase integration (CommonJS)
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const favicon = require('serve-favicon');
const path = require('path');

const app = express();
app.use(express.json());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Simple request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Health check root route
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Supabase Demo Backend</title>
</head>
<body>
  <h1>Supabase Demo Backend is running!</h1>
  <p>Use <code>/api/users</code> for API endpoints.</p>
</body>
</html>`);
});

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

// Get a single user by ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // TODO: Add Supabase Auth check here for security
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a user by ID (partial update)
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // TODO: Add Supabase Auth check here for security
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // TODO: Add Supabase Auth check here for security
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Supabase Auth Endpoints ---
// NOTE: For production, use Supabase client-side auth in frontend. These are for demo/testing only.

// Sign up a new user
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign in an existing user
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user (from access token)
app.get('/api/auth/user', async (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign out (client should just clear token)
app.post('/api/auth/signout', (req, res) => {
  // Supabase client handles sign out; just a placeholder for demo
  res.json({ message: 'Sign out on client by clearing token.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Supabase demo backend running on http://localhost:${PORT}`);
});
