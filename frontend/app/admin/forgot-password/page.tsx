"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Backend integration will be added later
    setTimeout(() => {
      alert("If this email exists, a password reset link will be sent.");
      setLoading(false);
      router.push("/admin");
    }, 1000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Forgot Password
        </h1>

        <p className="text-sm text-slate-600 mb-6">
          Enter your admin email. If it is registered, you will receive a reset
          link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-semibold
              hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <button
          onClick={() => router.push("/admin")}
          className="mt-4 text-sm text-slate-600 hover:text-slate-800"
        >
          ← Back to login
        </button>
      </div>
    </main>
  );
}
