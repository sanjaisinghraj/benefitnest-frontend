"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // basic validation (backend later)
    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    // TODO: connect real backend API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-50">
      {/* LEFT SIDE – BRAND / INFO */}
      <div className="hidden md:flex flex-col justify-center px-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <img
          src="/images/marketing/logo.png"
          alt="BenefitNest"
          className="h-10 mb-10"
        />

        <h1 className="text-4xl font-bold leading-tight mb-6">
          BenefitNest <br /> Admin Console
        </h1>

        <p className="text-lg opacity-90 max-w-md">
          Securely manage corporates, employees, benefits, claims, analytics,
          integrations and platform configurations — all from one place.
        </p>

        <ul className="mt-8 space-y-3 text-sm opacity-90">
          <li>✔ Corporate & Employee Management</li>
          <li>✔ Insurance & Benefits Configuration</li>
          <li>✔ Claims & Enrolment Monitoring</li>
          <li>✔ Reports, Analytics & Audit Logs</li>
          <li>✔ Role-based Admin Access</li>
        </ul>

        <p className="mt-12 text-xs opacity-70">
          © {new Date().getFullYear()} BenefitNest. Internal use only.
        </p>
      </div>

      {/* RIGHT SIDE – LOGIN FORM */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Admin Login
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Authorized administrators only
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@benefitnest.space"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to Admin"}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400">
            Protected by enterprise-grade security · Audit logs enabled
          </div>
        </div>
      </div>
    </div>
  );
}
