import React, { useState } from "react";
import { signUp, signIn, getCurrentUser, signOut } from "../services/backendApi";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await signUp(email, password);
      setToken(data.session?.access_token || "");
      setUser(data.user || null);
      setMode("signedin");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await signIn(email, password);
      setToken(data.session?.access_token || "");
      setUser(data.user || null);
      setMode("signedin");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetUser = async () => {
    setError("");
    try {
      const data = await getCurrentUser(token);
      setUser(data.user || null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = () => {
    setToken("");
    setUser(null);
    setMode("signin");
    signOut();
  };

  if (mode === "signedin" && user) {
    return (
      <div className="bg-white/10 rounded-2xl p-6 shadow-lg max-w-md w-full flex flex-col gap-4 items-center">
        <div className="font-bold text-lg">Signed in as</div>
        <div className="font-mono text-white/80">{user.email}</div>
        <button className="bg-fuchsia-600 px-4 py-2 rounded text-white font-bold" onClick={handleSignOut}>Sign Out</button>
        <button className="bg-blue-600 px-4 py-2 rounded text-white font-bold" onClick={handleGetUser}>Refresh User</button>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </div>
    );
  }

  return (
    <form
      onSubmit={mode === "signup" ? handleSignUp : handleSignIn}
      className="bg-white/10 rounded-2xl p-6 shadow-lg max-w-md w-full flex flex-col gap-4"
    >
      <div className="font-bold text-lg mb-1">{mode === "signup" ? "Sign Up" : "Sign In"} (Supabase Auth Demo)</div>
      <input
        className="rounded px-3 py-2 text-black"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        type="email"
      />
      <input
        className="rounded px-3 py-2 text-black"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        type="password"
      />
      <button className="bg-blue-600 px-4 py-2 rounded text-white font-bold" type="submit">
        {mode === "signup" ? "Sign Up" : "Sign In"}
      </button>
      <button
        type="button"
        className="underline text-fuchsia-400 text-sm"
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
      >
        {mode === "signup" ? "Already have an account? Sign In" : "No account? Sign Up"}
      </button>
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </form>
  );
}
