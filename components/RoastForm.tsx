"use client";

import { useState } from "react";

interface RoastFormProps {
  onSubmit: (username: string) => void;
  isLoading: boolean;
}

export default function RoastForm({ onSubmit, isLoading }: RoastFormProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmit(username.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="username" className="text-sm font-mono text-zinc-400">
          Enter GitHub Username
        </label>
        <div className="flex gap-2">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., torvalds"
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold px-6 py-2 rounded-lg transition-colors text-white font-mono"
          >
            {isLoading ? "Analyzing..." : "Roast!"}
          </button>
        </div>
      </div>
    </form>
  );
}