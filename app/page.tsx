"use client";

import React from "react";

export default function Page() {
  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
          <a href="/">
            <img src="/images/marketing/logo.png" alt="BenefitNest" className="h-10" />
          </a>

          <nav className="hidden md:flex gap-7 font-semibold">
            <a className="hover:text-blue-600" href="#">Platform</a>
            <a className="hover:text-blue-600" href="#">Features</a>
            <a className="hover:text-blue-600" href="#">Services</a>
            <a className="hover:text-blue-600" href="#">Customers</a>
            <a className="hover:text-blue-600" href="#">Resources</a>
          </nav>

          <div className="flex gap-3">
            <a
              href="https://admin.benefitnest.space/admin"
              className="px-4 py-2 rounded-lg border font-semibold hover:shadow"
            >
              Admin Login
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-lg"
            >
              Book a demo
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              Enterprise employee benefits platform
            </span>

            <h1 className="text-5xl font-bold leading-tight mb-6">
              Run, manage, and engage your employees in benefits — anywhere in the world.
            </h1>

            <p className="text-lg text-gray-600 max-w-xl">
              BenefitNest helps organisations manage employee insurance, benefits enrolment,
              claims, and analytics through a single secure platform.
            </p>

            <div className="flex gap-4 mt-8">
              <a className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-lg" href="#">
                Book a demo
              </a>
              <a className="px-6 py-3 rounded-lg border font-semibold hover:shadow" href="#features">
                Explore BenefitNest
              </a>
            </div>
          </div>

          <img
            src="/images/marketing/hero-illustration.jpg"
            alt="Hero"
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                All employee benefits. One secure platform.
              </h2>
              <p className="text-gray-600 mb-6">
                Centralise insurance, benefits, reimbursements, and engagement tools.
              </p>
              <a className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-lg" href="#">
                Learn more
              </a>
            </div>

            <img
              src="/images/marketing/feature-oneplace.jpg"
              alt="One place"
              className="rounded-2xl shadow-xl"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["feature-total-reward.jpg", "Total reward"],
              ["feature-insights.jpg", "HR analytics & reporting"],
              ["feature-reimbursement.jpg", "Claims & reimbursements"],
              ["feature-administration.jpg", "Benefits administration"],
              ["feature-search.jpg", "Employee self-service"],
              ["feature-content-assistant.jpg", "Smart assistance"],
            ].map(([img, title]) => (
              <div key={title} className="bg-white border rounded-2xl p-6 hover:shadow-lg">
                <img
                  src={`/images/marketing/${img}`}
                  alt={title}
                  className="rounded-xl mb-4"
                />
                <h3 className="font-semibold">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-4">How BenefitNest works</h2>
          <p className="text-gray-600 mb-10 max-w-2xl">
            One unified platform connecting insurance, benefits, reimbursements and engagement.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "overview-benefits.jpg",
              "overview-wallet.jpg",
              "overview-discounts.jpg",
              "overview-recognition.jpg",
              "overview-mobile.jpg",
              "overview-ai.jpg",
            ].map((img) => (
              <div key={img} className="bg-white border rounded-2xl p-6 text-center">
                <img
                  src={`/images/marketing/${img}`}
                  className="mx-auto rounded-xl mb-4 max-w-[200px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold">
            Ready to simplify employee benefits?
          </h2>
          <a className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg" href="#">
            Book a demo
          </a>
          <p className="opacity-90">Built for Indian enterprises. Scalable globally.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} BenefitNest. All rights reserved.
      </footer>
    </>
  );
}
