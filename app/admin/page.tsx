"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

export default function AdminPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 150);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Captcha is optional for now - just proceed with login
    // if (!captchaToken) {
    //   setError("Please complete captcha");
    //   return;
    // }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            rememberMe,
            captchaToken,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Get token from response (could be at root level or nested)
      const token = data.token || data.data?.token;

      if (!token) {
        setError("No token received from server");
        setLoading(false);
        return;
      }

      // Store token in BOTH cookie AND localStorage for maximum compatibility
      // Cookie (for middleware)
      document.cookie = `admin_token=${token}; path=/; ${
        rememberMe ? "max-age=2592000;" : ""
      }`;

      // localStorage (for API calls in React components)
      localStorage.setItem("admin_token", token);

      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center px-4">
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
      `}</style>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute top-10 right-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>
      <div className={`w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 ${entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}>
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
              analytics, integrations and platform configurations — all from one
              place.
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
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              className="h-8"
            />
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Admin Login</h2>
            <p className="text-slate-600 text-sm mt-1">
              Authorized administrators only
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => router.push("/admin/forgot-password")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token) => setCaptchaToken(token)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-semibold
                hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to Admin"}
            </button>
          </form>

          <button
            onClick={() => {
              window.location.href = "https://www.benefitnest.space";
            }}
            className="mt-4 text-sm text-slate-600 hover:text-slate-800"
          >
            ← Back to main site
          </button>

          <div className="mt-6 text-xs text-slate-500">
            Protected by enterprise-grade security · Audit logs enabled
          </div>
        </div>
      </div>
    </main>
  );
}
