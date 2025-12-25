"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

export default function AdminLoginPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const res = await fetch(
        "https://benefitnest-backend.onrender.com/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password,
            rememberMe,
            captchaToken: captchaToken || "skip" // Send "skip" if no token
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
        return;
      }

      // ✅ Store token
      localStorage.setItem("admin_token", data.token);

      // ✅ Redirect
      window.location.href = "/admin/dashboard";
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error - please try again");
      setLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div>
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              className="h-10 bg-white rounded-md p-1 mb-8"
            />

            <h1 className="text-3xl font-bold mb-4">Admin Console</h1>

            <p className="text-blue-100 mb-6">
              Securely manage corporates, employees, benefits,
              claims, analytics and platform configurations.
            </p>

            <ul className="space-y-3 text-sm">
              <li>✓ Corporate Management</li>
              <li>✓ Benefits & Insurance</li>
              <li>✓ Claims Monitoring</li>
              <li>✓ Reports & Audit Logs</li>
            </ul>
          </div>

          <p className="text-xs text-blue-200">
            © {new Date().getFullYear()} BenefitNest
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-1">Admin Login</h2>
          <p className="text-slate-600 text-sm mb-8">
            Authorized administrators only
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg"
                disabled={loading}
              />
            </div>

            <div className="flex justify-between text-sm">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => router.push("/admin/forgot-password")}
                className="text-blue-600 hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={handleCaptchaChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => (window.location.href = "https://www.benefitnest.space")}
            className="mt-4 text-sm text-slate-600 hover:text-slate-800"
            disabled={loading}
          >
            ← Back to main site
          </button>

          <p className="mt-6 text-xs text-slate-500">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </main>
  );
}
