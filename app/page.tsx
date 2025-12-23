"use client";

import React from "react";

export default function Page() {
  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
          <a href="/" className="block">
            <img src="/images/marketing/logo.png" alt="BenefitNest" className="h-10" />
          </a>

          <nav className="hidden md:flex gap-7 font-semibold text-gray-800">
            <a href="#" className="hover:text-blue-600">Platform</a>
            <a href="#" className="hover:text-blue-600">Features</a>
            <a href="#" className="hover:text-blue-600">Services</a>
            <a href="#" className="hover:text-blue-600">Customers</a>
            <a href="#" className="hover:text-blue-600">Resources</a>
          </nav>

          <div className="flex gap-3">
            <a
              href="https://admin.benefitnest.space/admin"
              className="px-4 py-2 rounded-lg font-semibold border border-gray-300 hover:shadow-md"
            >
              Admin Login
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:shadow-lg"
            >
              Book a demo
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">
              Enterprise employee benefits platform
            </span>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-5">
              Run, manage, and engage your employees in benefits — anywhere in the world.
            </h1>

            <p className="text-lg text-gray-600 max-w-xl">
              BenefitNest helps organisations manage employee insurance, benefits enrolment,
              claims, and analytics through a single secure platform.
            </p>

            <div className="flex gap-4 mt-6">
              <a className="px-5 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:shadow-lg" href="#">
                Book a demo
              </a>
              <a className="px-5 py-3 rounded-lg font-semibold border border-gray-300 hover:shadow-md" href="#features">
                Explore BenefitNest
              </a>
            </div>
          </div>

          <img
            src="/images/marketing/hero-illustration.jpg"
            alt="Employee benefits platform overview"
            className="rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                All employee benefits. One secure platform.
              </h2>
              <p className="text-gray-600 mb-6">
                Centralise insurance, benefits, reimbursements, and engagement tools so HR teams
                and employees operate from one system of record.
              </p>
              <a className="px-5 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:shadow-lg" href="#">
                Learn more
              </a>
            </div>

            <img
              src="/images/marketing/feature-oneplace.jpg"
              alt="One place, all benefits"
              className="rounded-xl shadow-lg"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {[
              ["feature-total-reward.jpg", "Total reward", "Unified view of insurance and benefits"],
              ["feature-insights.jpg", "HR analytics", "Actionable insights on enrolment & claims"],
              ["feature-reimbursement.jpg", "Claims & reimbursements", "Digitised policy-based claims"],
              ["feature-administration.jpg", "Benefits administration", "Plans, eligibility & lifecycle"],
              ["feature-search.jpg", "Employee self-service", "Reduce HR tickets"],
              ["feature-content-assistant.jpg", "Smart assistance", "AI-enabled help & FAQs"],
            ].map(([img, title, desc]) => (
              <div key={title} className="bg-white border rounded-xl p-6 shadow hover:shadow-lg">
                <img src={`/images/marketing/${img}`} className="rounded-lg mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE FEATURES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold mb-10">More features & services</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["feature-integrations.jpg", "Automation & integrations"],
              ["feature-comms.jpg", "Employee communications"],
              ["feature-support.jpg", "Admin & support"],
              ["feature-consulting.jpg", "Benefits consulting"],
            ].map(([img, title]) => (
              <div key={title} className="bg-white border rounded-xl p-6 shadow hover:shadow-lg">
                <img src={`/images/marketing/${img}`} className="rounded-lg mb-3" />
                <h4 className="font-semibold">{title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM OVERVIEW */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold mb-6">How BenefitNest works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "overview-benefits.jpg",
              "overview-wallet.jpg",
              "overview-discounts.jpg",
              "overview-recognition.jpg",
              "overview-mobile.jpg",
              "overview-ai.jpg",
            ].map((img) => (
              <div key={img} className="bg-white border rounded-xl p-6 text-center">
                <img src={`/images/marketing/${img}`} className="mx-auto mb-3 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-3xl font-bold">
            Ready to simplify employee benefits for your organisation?
          </h2>
          <a className="px-6 py-3 rounded-lg font-semibold bg-white text-blue-600 hover:shadow-lg text-lg" href="#">
            Book a demo
          </a>
          <p className="opacity-90">Built for Indian enterprises. Scalable globally.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        <p>© {new Date().getFullYear()} BenefitNest. All rights reserved.</p>
      </footer>
    </>
  );
}
