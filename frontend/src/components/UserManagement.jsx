import React, { useState } from "react";
import { getUserById, updateUser, deleteUser } from "../services/backendApi";

export default function UserManagement({ user, onUserUpdated, onUserDeleted }) {
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setUsername(user.username);
    setEmail(user.email);
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const updated = await updateUser(user.id, { username, email });
      onUserUpdated(updated);
      setEditMode(false);
    } catch {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this user?")) return;
    setLoading(true);
    setError("");
    try {
      await deleteUser(user.id);
      onUserDeleted(user.id);
    } catch {
      setError("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 py-2">
      {editMode ? (
        <>
          <input
            className="rounded px-2 py-1 text-black"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            className="rounded px-2 py-1 text-black"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <button className="bg-blue-600 px-2 py-1 rounded text-white" onClick={handleSave} disabled={loading}>Save</button>
          <button className="bg-gray-500 px-2 py-1 rounded text-white" onClick={handleCancel} disabled={loading}>Cancel</button>
        </>
      ) : (
        <>
          <span className="font-mono flex-1">{user.username}</span>
          <span className="text-white/60 text-sm flex-1">{user.email}</span>
          <button className="bg-fuchsia-600 px-2 py-1 rounded text-white" onClick={handleEdit} disabled={loading}>Edit</button>
          <button className="bg-red-600 px-2 py-1 rounded text-white" onClick={handleDelete} disabled={loading}>Delete</button>
        </>
      )}
      {error && <span className="text-red-400 text-xs ml-2">{error}</span>}
    </div>
  );
}
