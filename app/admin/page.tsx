"use client";

import { useState } from "react";

export default function AdminLoginPage(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // TEMP: replace with API later
    console.log("Admin login attempt:", { email, password });

    setTimeout(() => {
      setLoading(false);
      alert("Login API will be connected next.");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200">
        
        {/* Header */}
        <div className="px-6 pt-8 pb-6 text-center border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            BenefitNest Admin
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Authorized administrators only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@benefitnest.space"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Secure Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 text-center border-t border-slate-200 text-xs text-slate-500">
          © {new Date().getFullYear()} BenefitNest. All rights reserved.
        </div>
      </div>
    </main>
  );
}
