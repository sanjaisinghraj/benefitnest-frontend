"use client";

import React, { useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/images/marketing/logo.png"
                alt="BenefitNest"
                className="h-10 bg-white rounded-md p-1"
              />
              <span className="text-xl font-bold">BenefitNest</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight mb-4">
              Admin Console
            </h1>
            <p className="text-blue-100 mb-6">
              Securely manage corporates, employees, benefits, claims,
              analytics, integrations and platform configurations.
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                ✅ Corporate & Employee Management
              </li>
              <li className="flex items-center gap-2">
                ✅ Insurance & Benefits Configuration
              </li>
              <li className="flex items-center gap-2">
                ✅ Claims & Enrolment Monitoring
              </li>
              <li className="flex items-center gap-2">
                ✅ Reports, Analytics & Audit Logs
              </li>
              <li className="flex items-center gap-2">
                ✅ Role-based Admin Access
              </li>
            </ul>
          </div>

          <p className="text-xs text-blue-200 mt-10">
            © {new Date().getFullYear()} BenefitNest · Internal use only
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-900">
            Admin Login
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            Authorized administrators only
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@benefitnest.space"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" />
                Remember me
              </label>
              <a
                href="#"
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to Admin"}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              Protected by enterprise-grade security · Audit logs enabled
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
