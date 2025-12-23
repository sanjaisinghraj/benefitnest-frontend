"use client";

import React from "react";

export default function Page() {
  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="container nav">
          <a className="logo" href="/">
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


<a
  className="btn ghost"
  href="https://admin.benefitnest.space/admin"
>
  Admin Login
</a>
            <a className="btn primary" href="#">Book a demo</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Enterprise employee benefits platform</span>

            <h1>Run, manage, and engage your employees in benefits — anywhere in the world.</h1>
            <p>
              BenefitNest helps organisations manage employee insurance, benefits enrolment, claims, and analytics through a single secure platform.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#">Book a demo</a>
              <a className="btn ghost" href="#features">Explore BenefitNest</a>
            </div>
          </div>
          <div className="hero-media">
            <img
              className="hero-illustration"
              src="/images/marketing/hero-illustration.jpg"
              alt="Employee benefits platform overview"
            />
          </div>
        </div>
      </section>



{/* ADMIN LOGIN BOX */}
<div className="login-box">
  <form>
    <h3 className="login-title">Admin Login</h3>

    {/* Image */}
    <div className="login-image">
      <img src="/images/marketing/story-lendlease.jpg" alt="Admin Login" />
    </div>

    <input type="text" placeholder="Username" className="login-input" />
    <input type="password" placeholder="Password" className="login-input" />

    {/* Captcha */}
    <div className="captcha">
      <img src="/images/captcha-placeholder.png" alt="Captcha" />
      <input type="text" placeholder="Enter Captcha" className="login-input" />
    </div>

    <button type="submit" className="btn primary login-btn">Login</button>
    <a href="#" className="forgot-link">Forgot password?</a>
  </form>
</div>

      
      {/* CTA */}
      <section className="cta">
        <div className="container cta-inner">
          <h2>Ready to simplify employee benefits for your organisation?</h2>
          <a className="btn primary large" href="#">Book a demo</a>
          <p className="cta-note">Built for Indian enterprises. Scalable globally.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} BenefitNest. All rights reserved.</p>
        </div>
      </footer>

      {/* Styles */}
      <style jsx>{`
        /* Base */
        * { box-sizing: border-box; }
        body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; color: #0b1220; background: #f7f9fc; }
        a { text-decoration: none; color: inherit; }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }


/* Admin Login Box */
.login-box {
  flex: 1;
  display: flex;
  justify-content: center;
}

.login-box form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: stretch;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  max-width: 400px;   /* bigger box */
}

.login-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
  color: #0b1220;
}

.login-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 12px;
}

.login-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;   /* restrict image to box size */
}

.login-input {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.captcha {
  display: flex;
  gap: 8px;
  align-items: center;
}

.captcha img {
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

.forgot-link {
  font-size: 13px;
  text-align: center;
  color: #3563ff;
  margin-top: 6px;
}


        /* Header */
        .site-header { background: #fff; border-bottom: 1px solid #e8eef7; position: sticky; top: 0; z-index: 50; }
        .nav { height: 80px; display: flex; align-items: center; justify-content: space-between; }
        .logo img { height: 40px; display: block; }
        .menu { display: flex; gap: 28px; font-weight: 600; }
        .menu a { position: relative; }
        .menu a::after { content: ""; position: absolute; left: 0; bottom: -6px; width: 0; height: 2px; background: #3563ff; transition: width .2s ease; }
        .menu a:hover::after { width: 100%; }
        .actions { display: flex; gap: 12px; }
        .btn { padding: 10px 18px; border-radius: 12px; font-weight: 600; border: 1px solid #3563ff; color: #3563ff; background: #fff; transition: transform .08s ease, box-shadow .2s ease, background .2s ease, color .2s ease; }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(53, 99, 255, 0.2); }
        .btn.primary { background: #3563ff; color: #fff; }
        .btn.ghost { border-color: #e2e8f0; color: #0b1220; }
        .btn.large { padding: 14px 24px; border-radius: 14px; font-size: 18px; }

        /* Hero */
        .hero { padding: 80px 0; background: #f7f9fc; }
        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; background: #e9efff; color: #3563ff; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
        h1 { font-size: 48px; line-height: 1.1; margin-bottom: 18px; }
        .hero p { font-size: 18px; color: #475467; max-width: 540px; }
        .hero-actions { display: flex; gap: 12px; margin-top: 24px; }
        .hero-illustration { width: 100%; max-width: 560px; border-radius: 16px; box-shadow: 0 20px 40px rgba(11,18,32,0.12); }

        /* Sections */
        .section { padding: 80px 0; background: #fff; }
        .section.alt { background: #f7f9fc; }
        .split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 60px; }
        .feature-cta { margin-top: 18px; }
        .feature-img { width: 100%; max-width: 520px; border-radius: 16px; box-shadow: 0 16px 32px rgba(11,18,32,0.1); }

        /* CTA */
        .cta { padding: 80px 0; background: linear-gradient(135deg, #3563ff, #1e3fd8); color: #fff; text-align: center; }
        .cta-inner { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .cta-note { opacity: 0.9; }

        /* Footer */
        .site-footer { background: #0b1220; color: #cbd5e1; padding: 24px 0; text-align: center; font-size: 14px; }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-grid, .split { grid-template-columns: 1fr; }
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
          .feature-grid.compact { grid-template-columns: repeat(2, 1fr); }
          .overview-grid { grid-template-columns: repeat(2, 1fr); }
          .stories { grid-template-columns: 1fr 1fr; }
          .resources { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .menu { display: none; }
          h1 { font-size: 36px; }
          .feature-grid, .resources { grid-template-columns: 1fr; }
          .stories { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}