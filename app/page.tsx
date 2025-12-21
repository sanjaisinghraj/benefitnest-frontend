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
            <a href="#platform">Platform</a>
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <a href="#customers">Customers</a>
            <a href="#resources">Resources</a>
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
            <span className="badge">Enterprise employee benefits platform</span>

            <h1>
              Simplify employee benefits, insurance,
              <br />
              and engagement — at scale.
            </h1>

            <p>
              BenefitNest helps organisations manage employee insurance, benefits
              enrolment, claims, and analytics through a single secure platform —
              built for HR teams and employees alike.
            </p>

            <div className="hero-actions">
              <a className="btn primary" href="#">Book a demo</a>
              <a className="btn ghost" href="#features">Explore features</a>
            </div>

            <div className="hero-brands">
              <img
                src="/images/marketing/brands-strip.png"
                alt="Trusted by growing organisations"
              />
            </div>
          </div>

          <div className="hero-media">
            <img
              className="hero-illustration"
              src="/images/marketing/hero-illustration.jpg"
              alt="BenefitNest platform dashboard"
            />
          </div>
        </div>
      </section>

      {/* FEATURE OVERVIEW */}
      <section id="features" className="section alt">
        <div className="container">
          <div className="split">
            <div>
              <h2>One platform for all employee benefits</h2>
              <p>
                From insurance enrolment and claims to reimbursements and insights,
                BenefitNest brings every employee benefit into one unified system —
                reducing admin effort and improving employee experience.
              </p>

              <div className="feature-cta">
                <a className="btn primary" href="#">Learn more</a>
              </div>
            </div>

            <img
              src="/images/marketing/feature-oneplace.jpg"
              alt="Unified employee benefits platform"
              className="feature-img"
            />
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <img src="/images/marketing/feature-total-reward.jpg" alt="Total reward view" />
              <h3>Total reward visibility</h3>
              <p>
                Give employees a clear, real-time view of their insurance coverage,
                benefits, and overall reward value.
              </p>
            </div>

            <div className="feature-card">
              <img src="/images/marketing/feature-insights.jpg" alt="Analytics & insights" />
              <h3>Analytics & insights</h3>
              <p>
                Track benefits utilisation, claims trends, and engagement with
                actionable dashboards for HR and leadership.
              </p>
            </div>

            <div className="feature-card">
              <img src="/images/marketing/feature-reimbursement.jpg" alt="Reimbursements" />
              <h3>Reimbursements & allowances</h3>
              <p>
                Manage flexible benefit allowances and reimbursements with
                transparent rules and easy employee submissions.
              </p>
            </div>

            <div className="feature-card">
              <img src="/images/marketing/feature-administration.jpg" alt="Benefits administration" />
              <h3>Benefits administration</h3>
              <p>
                Handle enrolment, onboarding, eligibility, and communication
                workflows without spreadsheets or manual follow-ups.
              </p>
            </div>

            <div className="feature-card">
              <img src="/images/marketing/feature-search.jpg" alt="Employee support search" />
              <h3>Employee self-service</h3>
              <p>
                Enable employees to quickly find benefit details, policy coverage,
                and claim guidance without raising tickets.
              </p>
            </div>

            <div className="feature-card">
              <img src="/images/marketing/feature-content-assistant.jpg" alt="AI assistance" />
              <h3>Smart assistance</h3>
              <p>
                Use intelligent assistance to standardise benefits communication
                and reduce repetitive HR queries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}




{/* MORE FEATURES & SERVICES */}
<section className="section">
  <div className="container">
    <h2>Additional features & services</h2>

    <div className="feature-grid compact">
      <div className="feature-mini">
        <img src="/images/marketing/feature-integrations.jpg" alt="Integrations" />
        <h4>System integrations</h4>
        <p>
          Connect BenefitNest with HRMS, payroll, insurers, and finance systems
          to automate data flow and reduce manual effort.
        </p>
      </div>

      <div className="feature-mini">
        <img src="/images/marketing/feature-comms.jpg" alt="Employee communications" />
        <h4>Employee communications</h4>
        <p>
          Deliver clear, consistent benefit communication during onboarding,
          renewals, and claims to avoid confusion.
        </p>
      </div>

      <div className="feature-mini">
        <img src="/images/marketing/feature-support.jpg" alt="Support & operations" />
        <h4>Operations & support</h4>
        <p>
          Reduce HR workload with structured workflows, defined rules,
          and employee self-service backed by support.
        </p>
      </div>

      <div className="feature-mini">
        <img src="/images/marketing/feature-consulting.jpg" alt="Advisory services" />
        <h4>Benefits advisory</h4>
        <p>
          Get data-driven inputs to design, optimise, and manage employee
          benefit programs across locations.
        </p>
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
      BenefitNest brings together insurance, reimbursements, rewards,
      communication, and analytics into a single platform —
      giving HR teams full control and employees one clear destination.
    </p>

    <div className="overview-grid">
      <div className="overview-item">
        <img src="/images/marketing/overview-benefits.jpg" alt="Insurance & benefits" />
        <h4>Insurance & benefits</h4>
      </div>

      <div className="overview-item">
        <img src="/images/marketing/overview-wallet.jpg" alt="Allowances & wallet" />
        <h4>Allowances & wallet</h4>
      </div>

      <div className="overview-item">
        <img src="/images/marketing/overview-discounts.jpg" alt="Discounts" />
        <h4>Discounts & perks</h4>
      </div>

      <div className="overview-item">
        <img src="/images/marketing/overview-recognition.jpg" alt="Rewards" />
        <h4>Reward & recognition</h4>
      </div>

      <div className="overview-item">
        <img src="/images/marketing/overview-mobile.jpg" alt="Mobile access" />
        <h4>Mobile access</h4>
      </div>

      <div className="overview-item">
        <img src="/images/marketing/overview-ai.jpg" alt="Smart assistance" />
        <h4>Smart assistance</h4>
      </div>
    </div>
  </div>
</section>

{/* CHALLENGES & MODEL */}
<section className="section alt">
  <div className="container split">
    <div>
      <h2>Built for modern employee expectations</h2>
      <p>
        Employees expect the same simplicity at work that they experience
        in everyday digital products. BenefitNest focuses on clarity,
        speed, and ease — without compromising compliance.
      </p>
    </div>

    <img
      src="/images/marketing/challenges.jpg"
      alt="Modern employee expectations"
    />
  </div>

  <div className="container split">
    <img
      src="/images/marketing/model.jpg"
      alt="Scalable rollout model"
    />

    <div>
      <h2>Scalable rollout for growing organisations</h2>
      <p>
        Start simple and expand as your organisation grows.
        BenefitNest supports phased implementation —
        from basic insurance enrolment to advanced benefits management.
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
        <img src="/images/marketing/story-ocado.jpg" alt="Global retail organisation" />
        <h4>Global retail organisation</h4>
        <p>
          Improved employee engagement and benefit visibility across
          multiple regions.
        </p>
      </div>

      <div className="story">
        <img src="/images/marketing/story-lendlease.jpg" alt="Enterprise workforce" />
        <h4>Enterprise workforce</h4>
        <p>
          Streamlined insurance administration and reduced HR operational load.
        </p>
      </div>

      <div className="story">
        <img src="/images/marketing/story-salesforce.jpg" alt="Multi-country rollout" />
        <h4>Multi-country rollout</h4>
        <p>
          Centralised benefits management for employees across geographies.
        </p>
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
    <h2>Resources & insights</h2>

    <div className="resources">
      <div className="resource">
        <img
          src="/images/marketing/res-report-big-benefits.jpg"
          alt="Employee benefits industry report"
        />
        <h4>Employee benefits trends report</h4>
        <p>
          Key insights on how organisations are designing and managing
          employee benefits in a changing workforce.
        </p>
      </div>

      <div className="resource">
        <img
          src="/images/marketing/res-report-tech.jpg"
          alt="Benefits technology report"
        />
        <h4>Benefits & insurance technology guide</h4>
        <p>
          Understand how digital platforms are transforming benefits
          administration, claims, and employee engagement.
        </p>
      </div>

      <div className="resource">
        <img
          src="/images/marketing/res-guide-global.jpg"
          alt="Global benefits guide"
        />
        <h4>Managing benefits for distributed teams</h4>
        <p>
          Practical guidance for handling insurance and benefits across
          locations, roles, and employee categories.
        </p>
      </div>

      <div className="resource">
        <img
          src="/images/marketing/res-blog-valued.jpg"
          alt="Value of employee benefits"
        />
        <h4>What employees actually value in benefits</h4>
        <p>
          Learn which benefits drive real engagement and how technology
          helps communicate value clearly to employees.
        </p>
      </div>
    </div>
  </div>
</section>



 {/* CTA */}
<section className="cta">
  <div className="container cta-inner">
    <h2>Ready to simplify employee benefits and insurance management?</h2>
    <a className="btn primary large" href="#">
      Request a demo
    </a>
    <p className="cta-note">
      Built for corporates, employees, insurers, and TPAs — all on one platform.
    </p>
  </div>
</section>

{/* FOOTER */}
<footer className="site-footer">
  <div className="container">
    <p>
      © {new Date().getFullYear()} BenefitNest. All rights reserved.
    </p>
    <p style={{ marginTop: "6px", fontSize: "13px", opacity: 0.8 }}>
      Employee benefits • Insurance administration • Claims & engagement platform
    </p>
  </div>
</footer>

