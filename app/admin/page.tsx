"use client";

import { useState } from "react";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    // 🔒 TODO: connect backend auth API here
    console.log({ email, password });

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* HEADER (same as main site) */}
      <header className="site-header">
        <div className="container nav">
          <a className="logo" href="https://www.benefitnest.space">
            <img src="/images/marketing/logo.png" alt="BenefitNest" />
          </a>

          <nav className="menu">
            <a href="#">Platform</a>
            <a href="#">Features</a>
            <a href="#">Services</a>
            <a href="#">Customers</a>
            <a href="#">Resources</a>
          </nav>

          <div className="actions">
            <a className="btn ghost" href="https://www.benefitnest.space">
              Back to Website
            </a>
          </div>
        </div>
      </header>

      {/* HERO WITH ADMIN LOGIN */}
      <section className="hero">
        <div className="container hero-grid">
          {/* LEFT : ADMIN LOGIN */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              Admin Login
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Authorized administrators only
            </p>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@benefitnest.space"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="#" className="text-indigo-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Secure Sign In"}
              </button>
            </form>
          </div>

          {/* RIGHT : SAME HERO IMAGE */}
          <div className="hero-media">
            <img
              className="hero-illustration"
              src="/images/marketing/hero-illustration.jpg"
              alt="BenefitNest platform overview"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} BenefitNest. Admin access only.</p>
        </div>
      </footer>

      {/* STYLES (same base as main site) */}
      <style jsx>{`
        * { box-sizing: border-box; }
        body {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f7f9fc;
          color: #0b1220;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .site-header {
          background: #fff;
          border-bottom: 1px solid #e8eef7;
        }

        .nav {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo img {
          height: 40px;
        }

        .menu {
          display: flex;
          gap: 28px;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid #3563ff;
          color: #3563ff;
          background: #fff;
        }

        .btn.ghost {
          border-color: #e2e8f0;
          color: #0b1220;
        }

        .hero {
          padding: 80px 0;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-illustration {
          width: 100%;
          max-width: 560px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(11, 18, 32, 0.12);
        }

        .site-footer {
          background: #0b1220;
          color: #cbd5e1;
          padding: 24px 0;
          text-align: center;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .menu {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
