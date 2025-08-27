// --- Supabase Auth API functions ---
export async function signUp(email, password) {
  const res = await fetch('http://localhost:4000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Failed to sign up');
  return await res.json();
}

export async function signIn(email, password) {
  const res = await fetch('http://localhost:4000/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Failed to sign in');
  return await res.json();
}

export async function getCurrentUser(token) {
  const res = await fetch('http://localhost:4000/api/auth/user', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to get user');
  return await res.json();
}

export async function signOut() {
  // For demo: just clear token on client
  return true;
}
// src/services/backendApi.js
// Simple API client for the Supabase demo backend

export async function getUsers() {
  const res = await fetch('http://localhost:4000/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users;
}

export async function createUser(username, email) {
  const res = await fetch('http://localhost:4000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email })
  });
  if (!res.ok) throw new Error('Failed to create user');
  const data = await res.json();
  return data.user;
}

// Get a single user by ID
export async function getUserById(id) {
  const res = await fetch(`http://localhost:4000/api/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return await res.json();
}

// Update a user by ID (partial update)
export async function updateUser(id, updates) {
  const res = await fetch(`http://localhost:4000/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update user');
  return await res.json();
}

// Delete a user by ID
export async function deleteUser(id) {
  const res = await fetch(`http://localhost:4000/api/users/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete user');
  return true;
}
