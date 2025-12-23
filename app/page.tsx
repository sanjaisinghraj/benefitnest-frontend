"use client";

import React from "react";

export default function Page() {
  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between h-20">
          <img src="/images/marketing/logo.png" alt="BenefitNest" className="h-10" />

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
              className="px-4 py-2 rounded-lg border font-semibold hover:shadow-md"
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
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              Enterprise employee benefits platform
            </span>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
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
              <a className="px-6 py-3 rounded-lg border font-semibold hover:shadow-md" href="#features">
                Explore BenefitNest
              </a>
            </div>
          </div>

          {/* SAME HOVER EFFECT */}
          <img
            src="/images/marketing/hero-illustration.jpg"
            className="rounded-xl shadow-xl transition-transform duration-300 hover:scale-[1.02]"
            alt=""
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              All employee benefits. One secure platform.
            </h2>
            <p className="text-gray-600 mb-6">
              Centralise insurance, benefits, reimbursements, and engagement tools.
            </p>
            <a className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-lg" href="#">
              Learn more
            </a>
          </div>

          <img
            src="/images/marketing/feature-oneplace.jpg"
            className="rounded-xl shadow-xl transition-transform duration-300 hover:scale-[1.02]"
            alt=""
          />
        </div>

        {/* FEATURE CARDS */}
        <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-3 gap-6 mt-12">
          {[
            ["feature-total-reward.jpg", "Total reward"],
            ["feature-insights.jpg", "HR analytics & reporting"],
            ["feature-reimbursement.jpg", "Claims & reimbursements"],
          ].map(([img, title]) => (
            <div
              key={title}
              className="bg-white border rounded-xl p-6 shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-40 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                <img src={`/images/marketing/${img}`} className="object-cover h-full w-full" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-600">
                Unified and scalable benefit experience.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MORE FEATURES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-10">More features and services</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["feature-integrations.jpg", "Automation & integrations"],
              ["feature-comms.jpg", "Communications"],
              ["feature-support.jpg", "Administration & support"],
              ["feature-consulting.jpg", "Benefit consulting"],
            ].map(([img, title]) => (
              <div
                key={title}
                className="bg-white border rounded-xl p-6 shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-32 flex items-center justify-center overflow-hidden rounded-lg mb-3">
                  <img src={`/images/marketing/${img}`} className="object-cover h-full w-full" />
                </div>
                <h4 className="font-semibold">{title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-4">How BenefitNest works</h2>
          <p className="text-gray-600 mb-10 max-w-2xl">
            BenefitNest connects insurance, benefits, reimbursements, engagement, and analytics.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["overview-benefits.jpg", "Benefits"],
              ["overview-wallet.jpg", "Wallet"],
              ["overview-discounts.jpg", "Discounts"],
              ["overview-recognition.jpg", "Recognition"],
              ["overview-mobile.jpg", "Mobile"],
              ["overview-ai.jpg", "AI"],
            ].map(([img, title]) => (
              <div
                key={title}
                className="bg-white border rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-40 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                  <img src={`/images/marketing/${img}`} className="object-contain h-full" />
                </div>
                <h4 className="font-semibold">{title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER STORIES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-10">Customer stories</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "story-ocado.jpg",
              "story-lendlease.jpg",
              "story-salesforce.jpg",
            ].map((img) => (
              <div
                key={img}
                className="bg-white border rounded-xl p-6 shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-44 overflow-hidden rounded-lg mb-4">
                  <img src={`/images/marketing/${img}`} className="object-cover h-full w-full" />
                </div>
                <h4 className="font-semibold mb-1">Enterprise customer</h4>
                <p className="text-sm text-gray-600">Delivering measurable impact at scale.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} BenefitNest. All rights reserved.
      </footer>
    </>
  );
}
