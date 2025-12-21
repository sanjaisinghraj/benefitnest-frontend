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
            <a className="btn ghost" href="#">Log in</a>
            <a className="btn primary" href="#">Book a demo</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Global employee benefits</span>
            <h1>Run, manage, and engage your employees in benefits — anywhere in the world.</h1>
            <p>
              Create a consistent and connected global benefits experience with an online benefits platform.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#">Book a demo</a>
              <a className="btn ghost" href="#features">Explore features</a>
            </div>
            <div className="hero-brands">
              <img src="/images/marketing/brands-strip.png" alt="A global community of changemakers" />
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

      {/* FEATURE GRID */}
      <section id="features" className="section alt">
        <div className="container">
          <div className="split">
            <div>
              <h2>One place, all benefits</h2>
              <p>
                Choice, flexibility and every single benefit you offer in one place. Help employees understand how much
                they’re valued with a real-time view of their total reward package and insights into spend, budgeting,
                engagement and take-up.
              </p>
              <div className="feature-cta">
                <a className="btn primary" href="#">Learn more</a>
              </div>
            </div>
            <img
              src="/images/marketing/feature-oneplace.jpg"
              alt="One place, all benefits"
              className="feature-img"
            />
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <img src="/images/marketing/feature-total-reward.jpg" alt="Total reward" />
              <h3>Total reward</h3>
              <p>Real-time view of compensation and benefits to increase understanding and perceived value.</p>
            </div>
            <div className="feature-card">
              <img src="/images/marketing/feature-insights.jpg" alt="Insights" />
              <h3>Insights</h3>
              <p>Global insight into benefits spend, budgeting, engagement and take-up.</p>
            </div>
            <div className="feature-card">
              <img src="/images/marketing/feature-reimbursement.jpg" alt="Reimbursement accounts" />
              <h3>Reimbursement accounts</h3>
              <p>Give your workforce flexibility in benefits spending with card-based allowances.</p>
            </div>
            <div className="feature-card">
              <img src="/images/marketing/feature-administration.jpg" alt="Administration" />
              <h3>Administration</h3>
              <p>Manage the benefits workflow from pre-hire and onboarding to enrolment and communication.</p>
            </div>
            <div className="feature-card">
              <img src="/images/marketing/feature-search.jpg" alt="Supercharged search" />
              <h3>Supercharged search</h3>
              <p>Instant, customized answers to employee benefits questions.</p>
            </div>
            <div className="feature-card">
              <img src="/images/marketing/feature-content-assistant.jpg" alt="Content assistant" />
              <h3>Content assistant</h3>
              <p>AI-informed assistant to create benefits content at scale, effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REMAINING SECTIONS */}
      {/* All remaining image paths fixed in the same way */}
{/* MORE FEATURES & SERVICES */}
<section className="section">
  <div className="container">
    <h2>More features and services</h2>
    <div className="feature-grid compact">
      <div className="feature-mini">
        <img src="/images/marketing/feature-integrations.jpg" alt="Automation & integrations" />
        <h4>Automation & integrations</h4>
        <p>Integrate seamlessly with workplace systems and platforms.</p>
      </div>
      <div className="feature-mini">
        <img src="/images/marketing/feature-comms.jpg" alt="Communications" />
        <h4>Communications</h4>
        <p>Award-winning communications to boost understanding and engagement.</p>
      </div>
      <div className="feature-mini">
        <img src="/images/marketing/feature-support.jpg" alt="Administration & support" />
        <h4>Administration & support</h4>
        <p>Reduce administrative burden with 24/7 support in 100+ languages.</p>
      </div>
      <div className="feature-mini">
        <img src="/images/marketing/feature-consulting.jpg" alt="Benefit consulting" />
        <h4>Benefit consulting</h4>
        <p>Data-driven design for engaging global benefits experiences.</p>
      </div>
    </div>
    <div className="section-actions">
      <a className="btn ghost" href="#">Explore all features</a>
      <a className="btn ghost" href="#">Explore services</a>
    </div>
  </div>
</section>

{/* PLATFORM OVERVIEW */}
<section className="section alt">
  <div className="container">
    <h2>Platform overview</h2>
    <p>
      Connect all your employee benefits, wellbeing, reward, and recognition in one place — so your people have a
      single home for everything. Benefits administration, wallet allowances, discounts, recognition, mobile
      super-app, wellbeing programs, and AI-powered benefits — all together.
    </p>
    <div className="overview-grid">
      <div className="overview-item">
        <img src="/images/marketing/overview-benefits.jpg" alt="Benefits" />
        <h4>Benefits</h4>
      </div>
      <div className="overview-item">
        <img src="/images/marketing/overview-wallet.jpg" alt="Wallet" />
        <h4>Wallet</h4>
      </div>
      <div className="overview-item">
        <img src="/images/marketing/overview-discounts.jpg" alt="Discounts" />
        <h4>Discounts</h4>
      </div>
      <div className="overview-item">
        <img src="/images/marketing/overview-recognition.jpg" alt="Reward & Recognition" />
        <h4>Reward & Recognition</h4>
      </div>
      <div className="overview-item">
        <img src="/images/marketing/overview-mobile.jpg" alt="Mobile" />
        <h4>Mobile</h4>
      </div>
      <div className="overview-item">
        <img src="/images/marketing/overview-ai.jpg" alt="AI-powered Benefits" />
        <h4>AI-powered Benefits</h4>
      </div>
    </div>
  </div>
</section>

{/* CHALLENGES & MODEL */}
<section className="section alt">
  <div className="container split">
    <div>
      <h2>Consumer-grade employee benefits technology</h2>
      <p>
        Employee expectations have adapted to the technology they use outside work; it’s time to give them the tech
        they expect, and deserve.
      </p>
    </div>
    <img src="/images/marketing/challenges.jpg" alt="Modern technology expectations" />
  </div>
  <div className="container split">
    <img src="/images/marketing/model.jpg" alt="Simple-to-Complex rollout model" />
    <div>
      <h2>A Simple-to-Complex model for global rollouts</h2>
      <p>
        Implementing a global benefits solution doesn’t need to be stressful. From communicating simple content to
        managing complex rules, eligibility, options and flexibility — get it right first time.
      </p>
    </div>
  </div>
</section>

{/* CUSTOMER STORIES */}
<section className="section">
  <div className="container">
    <h2>Customer stories</h2>
    <div className="stories">
      <div className="story">
        <img src="/images/marketing/story-ocado.jpg" alt="Ocado Group" />
        <h4>Ocado Group</h4>
        <p>Celebrate achievements of people worldwide.</p>
      </div>
      <div className="story">
        <img src="/images/marketing/story-lendlease.jpg" alt="Lendlease" />
        <h4>Lendlease</h4>
        <p>Build an award-winning benefits strategy.</p>
      </div>
      <div className="story">
        <img src="/images/marketing/story-salesforce.jpg" alt="Salesforce" />
        <h4>Salesforce</h4>
        <p>Launched global benefits tech in 30+ countries.</p>
      </div>
    </div>
    <div className="section-actions">
      <a className="btn ghost" href="#">See all customer stories</a>
    </div>
  </div>
</section>

{/* RESOURCES */}
<section className="section">
  <div className="container">
    <h2>Related resources, events & insights</h2>
    <div className="resources">
      <div className="resource">
        <img src="/images/marketing/res-report-big-benefits.jpg" alt="The Big Benefits Report" />
        <h4>The Big Benefits Report</h4>
      </div>
      <div className="resource">
        <img src="/images/marketing/res-report-tech.jpg" alt="Employee Benefits Tech Report" />
        <h4>Employee Benefits Tech Report</h4>
      </div>
      <div className="resource">
        <img src="/images/marketing/res-guide-global.jpg" alt="Going global with benefits" />
        <h4>Going global with benefits</h4>
      </div>
      <div className="resource">
        <img src="/images/marketing/res-blog-valued.jpg" alt="Most valued benefits & tech" />
        <h4>The impact of offering the most valued benefits, with the right tech</h4>
      </div>
    </div>
  </div>
</section>









   






      {/* CTA */}
      <section className="cta">
        <div className="container cta-inner">
          <h2>Ready to launch an award-winning employee benefits experience?</h2>
          <a className="btn primary large" href="#">Book a demo</a>
          <p className="cta-note">A global community of changemakers.</p>
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
        .hero-brands img { width: 100%; max-width: 560px; margin-top: 28px; opacity: 0.9; }
        .hero-illustration { width: 100%; max-width: 560px; border-radius: 16px; box-shadow: 0 20px 40px rgba(11,18,32,0.12); }

        /* Sections */
        .section { padding: 80px 0; background: #fff; }
        .section.alt { background: #f7f9fc; }
        .split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 60px; }
        .feature-cta { margin-top: 18px; }
        .feature-img { width: 100%; max-width: 520px; border-radius: 16px; box-shadow: 0 16px 32px rgba(11,18,32,0.1); }

        /* Feature grid */
        .feature-grid { margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-grid.compact { grid-template-columns: repeat(4, 1fr); }
        .feature-card, .feature-mini { background: #fff; border: 1px solid #e8eef7; border-radius: 16px; padding: 20px; transition: transform .08s ease, box-shadow .2s ease; }
        .feature-card:hover, .feature-mini:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(11,18,32,0.12); }
        .feature-card img, .feature-mini img { width: 100%; border-radius: 12px; margin-bottom: 12px; }
        .feature-card h3 { font-size: 18px; margin-bottom: 4px; }
        .feature-mini h4 { font-size: 16px; margin-bottom: 6px; }
        .feature-card p, .feature-mini p { color: #475467; font-size: 15px; }

        /* Overview */
        .overview-grid { margin-top: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .overview-item { text-align: center; background: #fff; border: 1px solid #e8eef7; border-radius: 16px; padding: 18px; }
        .overview-item img { width: 100%; max-width: 200px; margin: 0 auto 10px; display: block; }

        /* Metrics */
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .metric { background: #fff; border: 1px solid #e8eef7; border-radius: 16px; padding: 24px; text-align: center; }
        .metric-value { display: block; font-size: 32px; font-weight: 800; color: #1e3fd8; }
        .metric-label { display: block; font-size: 14px; color: #475467; margin-top: 6px; }
        .quote { margin-top: 28px; font-size: 18px; line-height: 1.6; color: #0b1220; }
        .quote cite { display: block; margin-top: 8px; color: #475467; }

        /* Stories */
        .stories { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .story { background: #fff; border: 1px solid #e8eef7; border-radius: 16px; padding: 20px; }
        .story img { width: 100%; border-radius: 12px; margin-bottom: 10px; }
        .story h4 { margin-bottom: 6px; }

        /* FAQs */
        .faqs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
        .faq { background: #fff; border: 1px solid #e8eef7; border-radius: 12px; padding: 14px 16px; }
        .faq summary { cursor: pointer; font-weight: 600; }
        .faq-body { margin-top: 10px; color: #475467; }

        /* Resources */
        .resources { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 16px; }
        .resource { background: #fff; border: 1px solid #e8eef7; border-radius: 16px; padding: 18px; }
        .resource img { width: 100%; border-radius: 12px; margin-bottom: 8px; }

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
          .metrics { grid-template-columns: repeat(2, 1fr); }
          .stories { grid-template-columns: 1fr 1fr; }
          .faqs { grid-template-columns: 1fr; }
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
