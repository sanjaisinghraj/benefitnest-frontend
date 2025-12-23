"use client";

import React from "react";

export default function Page() {
  return (
    <>
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
          <a href="/">
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              className="h-10"
            />
          </a>

          <nav className="hidden md:flex gap-8 font-semibold text-gray-700">
            {["Platform", "Features", "Services", "Customers", "Resources"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 hover:after:w-full after:transition-all"
                >
                  {item}
                </a>
              )
            )}
          </nav>

          <div className="flex gap-3">
            <a
              href="https://admin.benefitnest.space/admin"
              className="px-4 py-2 rounded-lg font-semibold border hover:bg-gray-100"
            >
              Admin Login
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Book a demo
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
              Enterprise employee benefits platform
            </span>

            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Run, manage, and engage your employees in benefits — anywhere in the
              world.
            </h1>

            <p className="text-lg text-gray-600 max-w-xl">
              Manage insurance, benefits enrolment, claims, engagement, and
              analytics from one secure platform.
            </p>

            <div className="flex gap-4 mt-8">
              <a className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700">
                Book a demo
              </a>
              <a className="px-6 py-3 rounded-lg font-semibold border hover:bg-gray-100">
                Explore BenefitNest
              </a>
            </div>
          </div>

          <div className="relative group">
            <img
              src="/images/marketing/hero-illustration.jpg"
              className="rounded-2xl shadow-2xl transition-transform group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                All employee benefits. One secure platform.
              </h2>
              <p className="text-gray-600 mb-6">
                Centralise insurance, benefits, reimbursements, and engagement.
              </p>
            </div>

            <img
              src="/images/marketing/feature-oneplace.jpg"
              className="rounded-2xl shadow-xl hover:scale-[1.02] transition"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-14">
            {[
              {
                img: "feature-total-reward.jpg",
                title: "Total reward",
                desc: "Unified view of benefits & compensation",
              },
              {
                img: "feature-insights.jpg",
                title: "HR analytics & reporting",
                desc: "Actionable insights for HR teams",
              },
              {
                img: "feature-reimbursement.jpg",
                title: "Claims & reimbursements",
                desc: "Policy-based automated processing",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-white border rounded-2xl p-6 shadow hover:shadow-2xl transition"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl mb-4">
                  <img
                    src={`/images/marketing/${f.img}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE FEATURES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold mb-10">
            More features and services
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              "integrations",
              "comms",
              "support",
              "consulting",
            ].map((k) => (
              <div
                key={k}
                className="group bg-white border rounded-2xl p-6 hover:shadow-xl transition"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-4">
                  <img
                    src={`/images/marketing/feature-${k}.jpg`}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <h4 className="font-semibold capitalize">{k}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold mb-4">How BenefitNest works</h2>
          <p className="text-gray-600 mb-10">
            A single HR benefits hub connecting everything.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "benefits",
              "wallet",
              "discounts",
              "recognition",
              "mobile",
              "ai",
            ].map((k) => (
              <div
                key={k}
                className="group bg-white border rounded-2xl p-6 text-center hover:shadow-xl transition"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-4">
                  <img
                    src={`/images/marketing/overview-${k}.jpg`}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <h4 className="font-semibold capitalize">{k}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-6">
          Ready to simplify employee benefits?
        </h2>
        <a className="inline-block px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:scale-105 transition">
          Book a demo
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} BenefitNest. All rights reserved.
      </footer>
    </>
  );
}
