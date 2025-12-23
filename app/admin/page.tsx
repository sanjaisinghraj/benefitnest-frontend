"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TODO: connect backend API
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    console.log({ email, password });

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Administration Portal</span>
            <h1>Secure Admin Login</h1>
            <p>
              Access the BenefitNest Administration Portal to manage employee benefits,
              claims, and analytics with enterprise‑grade security.
            </p>
          </div>
          <div className="hero-media">
            <img
              src="/images/marketing/admin-login-illustration.jpg"
              alt="Admin login illustration"
              className="hero-illustration"
            />
          </div>
        </div>
      </section>

      {/* LOGIN CARD */}
      <section className="section alt">
        <div className="container flex justify-center">
          <div className="login-card">
            <h2 className="text-center">Admin Login</h2>
            <p className="text-center text-gray-600 mb-4">
              BenefitNest Administration Portal
            </p>

            {error && (
              <div className="error-box">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="admin@benefitnest.space"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn primary w-full"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="footer-note">
              © {new Date().getFullYear()} BenefitNest. Admin access only.
            </p>
          </div>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        .hero {
          padding: 80px 0;
          background: linear-gradient(135deg, #f7f9fc, #e9efff);
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 999px;
          background: #e9efff;
          color: #3563ff;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 42px;
          line-height: 1.1;
          margin-bottom: 18px;
        }
        .hero p {
          font-size: 18px;
          color: #475467;
          max-width: 540px;
        }
        .hero-illustration {
          width: 100%;
          max-width: 480px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(11,18,32,0.12);
        }

        .login-card {
          background: #fff;
          border: 1px solid #e8eef7;
          border-radius: 16px;
          padding: 32px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 16px 32px rgba(11,18,32,0.1);
        }
        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #0b1220;
        }
        .input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          outline: none;
        }
        .input:focus {
          border-color: #3563ff;
          box-shadow: 0 0 0 2px rgba(53, 99, 255, 0.2);
        }
        .btn.primary {
          background: #3563ff;
          color: #fff;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.2s ease;
        }
        .btn.primary:hover {
          background: #1e3fd8;
        }
        .error-box {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .footer-note {
          margin-top: 16px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}