"use client";

import { useState, FormEvent } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // backend wiring baad me
    console.log("Admin login:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/marketing/logo.png"
            alt="BenefitNest"
            className="h-10"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-center text-slate-900">
          Admin Login
        </h1>
        <p className="text-sm text-center text-slate-500 mt-1 mb-6">
          Authorized administrators only
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@benefitnest.space"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Secure Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-slate-400 mt-6">
          © {new Date().getFullYear()} BenefitNest
        </p>
      </div>
    </div>
  );
}
