"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TODO: connect backend API
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    console.log({ email, password });

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-sky-300 relative overflow-hidden px-4">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('/images/marketing/clouds-bg.svg')] bg-cover opacity-20 pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-indigo-700">WELCOME</h1>
          <p className="text-gray-600 mt-2 text-sm">
            BenefitNest Administration Portal by Sanjai
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@benefitnest.space"
            />
            <span className="absolute left-3 top-9 text-gray-400">
              📧
            </span>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
            <span className="absolute left-3 top-9 text-gray-400">
              🔒
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-indigo-600">
          <a href="#" className="hover:underline">Forgot your Password?</a>
          <a href="#" className="hover:underline">Sign up</a>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} BenefitNest. Admin access only.
        </div>
      </div>
    </div>
  );
}