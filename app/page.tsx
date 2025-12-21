import React from "react";

export default function HomePage() {
  return (
    <>
      <header>
        <div className="container nav">
          <div className="logo-wrap">
            <img src="assets/images/logo.png" alt="BenefitNest" />
          </div>

          <nav className="menu">
            <a href="#">Platform</a>
            <a href="#">Solutions</a>
            <a href="#">Why Us</a>
            <a href="#">Resources</a>
          </nav>

          <div className="actions">
            <button className="btn">Admin</button>
            <button className="btn">Login</button>
            <button className="btn primary">Get Started</button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="badge">EMPLOYEE BENEFITS PLATFORM</div>
            <h1>Deliver benefits your people actually use</h1>
            <p>
              BenefitNest brings insurance, benefits, enrollment and claims
              together in one modern, enterprise-ready platform.
            </p>
            <div className="hero-actions">
              <button className="btn primary">Get Started</button>
              <button className="btn">Learn More</button>
            </div>
          </div>

          <img src="assets/images/hero-illustration.png" alt="Hero Illustration" />
        </div>
      </section>

      <section className="caps">
        <div className="container cap-grid">
          <div className="cap">Secure by Design</div>
          <div className="cap">Enterprise Ready</div>
          <div className="cap">Scalable Architecture</div>
          <div className="cap">HR & Employee Friendly</div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>Centralised Benefits Hub</h2>
            <p>
              Give employees a single place to view, understand and manage all
              their benefits through one intuitive platform.
            </p>
          </div>
          <img src="assets/images/benefits-illustration.png" alt="Benefits Illustration" />
        </div>
      </section>

      <section className="section alt">
        <div className="container split">
          <img src="assets/images/insurance-illustration.png" alt="Insurance Illustration" />
          <div>
            <h2>Insurance Management</h2>
            <p>
              Manage group health, life and add-on policies digitally with full
              visibility into coverage and renewals.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>Claims & Support</h2>
            <p>
              Enable faster claims with guided digital journeys and real-time
              tracking.
            </p>
          </div>
          <img src="assets/images/claims-illustration.png" alt="Claims Illustration" />
        </div>
      </section>

      <section className="how">
        <div className="container">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <span>01</span>
              <h3>Configure Benefits</h3>
              <p>Admins define policies and eligibility.</p>
            </div>
            <div className="step">
              <span>02</span>
              <h3>Employee Enrollment</h3>
              <p>Employees enroll digitally.</p>
            </div>
            <div className="step">
              <span>03</span>
              <h3>Ongoing Management</h3>
              <p>Claims, updates and analytics.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to transform your benefits experience?</h2>
          <p>Start with BenefitNest today.</p>
        </div>
      </section>

      <footer>
        © 2025 BenefitNest. All rights reserved.<br />
        Created by Sanjai
      </footer>

      {/* Inline CSS */}
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0b1220;
          background: #f7f9fc;
        }
        a {
          text-decoration: none;
          color: inherit;
        }
        .container {
          max-width: 1280px;
          margin: auto;
          padding: 0 40px;
        }
        header {
          height: 96px;
          background: #fff;
          border-bottom: 1px solid #e8eef7;
        }
        .nav {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo-wrap img {
          height: 56px;
          width: auto;
          display: block;
        }
        .menu {
          display: flex;
          gap: 36px;
          font-weight: 600;
        }
        .actions {
          display: flex;
          gap: 14px;
        }
        .btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid #3563ff;
          background: #fff;
          color: #3563ff;
          cursor: pointer;
        }
        .btn.primary {
          background: #3563ff;
          color: #fff;
        }
        .hero {
          padding: 96px 0;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          gap: 80px;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 999px;
          background: #e9efff;
          color: #3563ff;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 18px;
        }
        h1 {
          font-size: 56px;
          line-height: 1.05;
          margin-bottom: 22px;
        }
        .hero p {
          font-size: 18px;
          color: #475467;
          max-width: 520px;
        }
        .hero-actions {
          margin-top: 32px;
          display: flex;
          gap: 16px;
        }
        .caps {
          padding: 40px 0 80px;
        }
        .cap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .cap {
          background: #fff;
          padding: 22px;
          border-radius: 16px;
          text-align: center;
          font-weight: 600;
          border: 1px solid #e8eef7;
        }
        .section {
          padding: 100px 0;
          background: #fff;
        }
        .section.alt {
          background: #f7f9fc;
        }
        .split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 80px;
        }
        .section h2 {
          font-size: 40px;
          margin-bottom: 16px;
        }
        .section p {
          font-size: 17px;
          color: #475467;
          max-width: 520px;
        }
        .how {
          padding: 120px 0;
        }
        .how h2 {
          text-align: center;
          font-size: 44px;
          margin-bottom: 64px;
        }
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .step {
          background: #fff;
          padding: 40px;
          border-radius: 20px;
          border: 1px solid #e8eef7;
        }
        .step span {
          font-size: 28px;
          font-weight: 800;
          color: #3563ff;
        }
              .cta {
          padding: 100px 0;
          background: linear-gradient(135deg, #3563ff, #1e3fd8);
          color: #fff;
          text-align: center;
        }
        .cta h2 {
          font-size: 42px;
          margin-bottom: 16px;
        }
        .cta p {
          opacity: 0.9;
        }
        footer {
          background: #0b1220;
          color: #cbd5e1;
          padding: 28px 0;
          text-align: center;
          font-size: 14px;
        }
      `}</style>
    </>
  );
}