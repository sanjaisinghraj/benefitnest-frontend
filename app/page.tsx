"use client";

import React from "react";

export default function Page() {
  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between h-20">
          <a href="/" className="block">
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              className="h-10"
            />
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
              className="px-4 py-2 rounded-lg font-semibold border border-gray-300 hover:shadow"
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
        <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block mb-4 px-4 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600">
              Enterprise employee benefits platform
            </span>

            <h1 className="text-5xl font-bold leading-tight mb-5">
              Run, manage, and engage your employees in benefits — anywhere in the world.
            </h1>

            <p className="text-lg text-gray-600 max-w-xl">
              BenefitNest helps organisations manage employee insurance, benefits enrolment,
              claims, and analytics through a single secure platform.
            </p>

            <div className="flex gap-4 mt-6">
              <a className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-lg" href="#">
                Book a demo
              </a>
              <a className="px-5 py-3 border rounded-lg font-semibold hover:shadow" href="#features">
                Explore BenefitNest
              </a>
            </div>
          </div>

          <img
            src="/images/marketing/hero-illustration.jpg"
            alt="Platform overview"
            className="rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-14">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                All employee benefits. One secure platform.
              </h2>
              <p className="text-gray-600 mb-6">
                Centralise insurance, benefits, reimbursements, and engagement tools.
              </p>
              <a className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:shadow" href="#">
                Learn more
              </a>
            </div>

            <img
              src="/images/marketing/feature-oneplace.jpg"
              alt="All benefits in one place"
              className="rounded-xl shadow-lg"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["feature-total-reward", "Total reward"],
              ["feature-insights", "HR analytics & reporting"],
              ["feature-reimbursement", "Claims & reimbursements"],
              ["feature-administration", "Benefits administration"],
              ["feature-search", "Employee self-service"],
              ["feature-content-assistant", "Smart assistance"],
            ].map(([img, title]) => (
              <div key={img} className="bg-white border rounded-xl p-6 shadow hover:shadow-lg">
                <img
                  src={`/images/marketing/${img}.jpg`}
                  alt={title}
                  className="rounded-lg mb-3"
                />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">
                  Designed to simplify HR operations and improve employee experience.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-8">More features and services</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["feature-integrations", "Automation & integrations"],
              ["feature-comms", "Communications"],
              ["feature-support", "Administration & support"],
              ["feature-consulting", "Benefit consulting"],
            ].map(([img, title]) => (
              <div key={img} className="border rounded-xl p-5 bg-gray-50 hover:shadow">
                <img
                  src={`/images/marketing/${img}.jpg`}
                  alt={title}
                  className="rounded-lg mb-3"
                />
                <h4 className="font-semibold mb-1">{title}</h4>
                <p className="text-sm text-gray-600">
                  Enterprise-ready, scalable, and globally compliant.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-4">How BenefitNest works</h2>
          <p className="text-gray-600 mb-10 max-w-3xl">
            BenefitNest connects insurance, benefits, reimbursements, engagement,
            and analytics into a single HR benefits hub.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "overview-benefits",
              "overview-wallet",
              "overview-discounts",
              "overview-recognition",
              "overview-mobile",
              "overview-ai",
            ].map((img) => (
              <div key={img} className="bg-white border rounded-xl p-6 text-center">
                <img
                  src={`/images/marketing/${img}.jpg`}
                  alt={img}
                  className="mx-auto mb-3 rounded-lg"
                />
                <h4 className="font-semibold capitalize">
                  {img.replace("overview-", "").replace("-", " ")}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10 space-y-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Built for employees. Designed for HR.
              </h2>
              <p className="text-gray-600">
                Consumer-grade experience with enterprise-grade security.
              </p>
            </div>
            <img
              src="/images/marketing/challenges.jpg"
              className="w-3/4 mx-auto rounded-xl shadow"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <img
              src="/images/marketing/model.jpg"
              className="w-3/4 mx-auto rounded-xl shadow"
            />
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Scales from pilot to enterprise rollout
              </h2>
              <p className="text-gray-600">
                Start simple. Scale globally without rework.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER STORIES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-8">Customer stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["ocado", "lendlease", "salesforce"].map((img) => (
              <div key={img} className="bg-white border rounded-xl p-6 shadow">
                <img
                  src={`/images/marketing/story-${img}.jpg`}
                  className="rounded-lg mb-3"
                />
                <h4 className="font-semibold mb-2">Enterprise customer</h4>
                <p className="text-sm text-gray-600">
                  Delivering measurable impact at scale.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-8">
            Related resources, events & insights
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              "res-report-big-benefits",
              "res-report-tech",
              "res-guide-global",
              "res-blog-valued",
            ].map((img) => (
              <div key={img} className="border rounded-xl p-5 shadow bg-gray-50">
                <img
                  src={`/images/marketing/${img}.jpg`}
                  className="rounded-lg mb-3"
                />
                <h4 className="font-semibold text-sm">
                  Insightful industry resource
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to simplify employee benefits?
        </h2>
        <a className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg" href="#">
          Book a demo
        </a>
        <p className="mt-3 opacity-90">
          Built for Indian enterprises. Scalable globally.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} BenefitNest. All rights reserved.
      </footer>
    </>
  );
}
