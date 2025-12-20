"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      /* Store token securely (temporary – httpOnly later) */
      localStorage.setItem("bn_admin_token", data.token);

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-slate-50">

      {/* LEFT BRAND */}
      <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-12">
        <div>
          <h1 className="text-4xl font-bold mb-6">BenefitNest</h1>
          <p className="text-slate-200 max-w-md">
            Secure enterprise platform for employee benefits, insurance,
            analytics and compliance.
          </p>
        </div>

        <Image
          src="/images/marketing/admin-login-illustration.jpg"
          alt="Admin Login"
          width={500}
          height={400}
          className="rounded-xl shadow-2xl"
        />
      </section>

      {/* RIGHT LOGIN */}
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-3xl font-bold mb-2">Admin Login</h2>
          <p className="text-slate-600 mb-6">
            Authorized administrators only.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            <input
              type="email"
              placeholder="admin@benefitnest.space"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
            />

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Signing in..." : "Secure Sign In"}
            </button>

          </form>

          <p className="text-xs text-slate-400 mt-6 text-center">
            © {new Date().getFullYear()} BenefitNest
          </p>
        </div>
      </section>

    </main>
  );
}
