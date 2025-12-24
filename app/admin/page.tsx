"use client";

import { useState } from "react";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/images/marketing/logo.png"
                alt="BenefitNest"
                className="h-10 bg-white rounded-md p-1"
              />
            </div>

            <h1 className="text-3xl font-bold mb-4">Admin Console</h1>

            <p className="text-blue-100 mb-6 leading-relaxed">
              Securely manage corporates, employees, benefits, claims,
              analytics, integrations and platform configurations — all from one place.
            </p>

            <ul className="space-y-3 text-sm">
              <li>✓ Corporate & Employee Management</li>
              <li>✓ Insurance & Benefits Configuration</li>
              <li>✓ Claims & Enrollment Monitoring</li>
              <li>✓ Reports, Analytics & Audit Logs</li>
              <li>✓ Role-based Admin Access</li>
            </ul>
          </div>

          <p className="text-xs text-blue-200 mt-10">
            © {new Date().getFullYear()} BenefitNest · Internal use only
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Admin Login</h2>
            <p className="text-slate-600 text-sm mt-1">
              Authorized administrators only
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              // TODO: Implement backend authentication
              // Example: await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })
            }}
          >
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" />
                Remember me
              </label>

              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-semibold
                hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in to Admin"}
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-500">
            Protected by enterprise-grade security · Audit logs enabled
          </div>
        </div>
      </div>
    </main>
  );
}