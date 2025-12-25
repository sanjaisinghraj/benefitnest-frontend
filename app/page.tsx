"use client";

import React, { useEffect, useState } from "react";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* GLOBAL ANIMATION (ADDED ONLY) */}
      <style jsx global>{`
        @keyframes zoomFade {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
          80% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>

      {/* HEADER (UNCHANGED) */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              className="h-10"
            />
          </a>

          {/* MENU */}
          <nav className="hidden md:flex gap-8 font-semibold text-gray-800">
            {[
              { name: "Platform", items: ["Employee Portal", "Admin Dashboard", "Claims Engine"] },
              { name: "Features", items: ["Enrollments", "Claims", "Analytics", "AI Support"] },
              { name: "Services", items: ["Implementation", "Support", "Consulting"] },
              { name: "Customers", items: ["Mid-size Firms", "Large Enterprises"] },
              { name: "Resources", items: ["Guides", "Reports", "Blogs"] },
            ].map((menu) => (
              <div key={menu.name} className="relative group">
                <span className="cursor-pointer hover:text-blue-600">
                  {menu.name}
                </span>
                <div className="absolute left-0 mt-3 w-56 bg-white border rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                  {menu.items.map((i) => (
                    <a
                      key={i}
                      href="#"
                      className="block px-4 py-3 text-sm hover:bg-blue-50"
                    >
                      {i}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex gap-3">
            <a
              href="https://admin.benefitnest.space/admin"
              className="px-4 py-2 rounded-lg font-semibold border hover:bg-gray-100 transition"
            >
              Admin Login
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Book a demo
            </a>
          </div>
        </div>
      </header>

      {/* WELCOME OVERLAY (ADDED ONLY) */}
      {showWelcome && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white">
          <h1
            className="text-6xl md:text-7xl font-extrabold text-blue-700"
            style={{ animation: "zoomFade 2.5s ease-in-out forwards" }}
          >
            Welcome to BenefitNest
          </h1>
        </div>
      )}

      {/* HERO */}
<main
  className={`transition-all duration-[2500ms] ease-in-out ${
    showWelcome ? "blur-md opacity-40" : "blur-0 opacity-100"
  }`}
>

      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">
              Enterprise employee benefits platform
            </span>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Run, manage, and engage your employees in benefits — anywhere in
              the world.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              BenefitNest helps organisations manage employee insurance, benefits
              enrolment, claims, and analytics through a single secure platform.
            </p>
            <div className="flex gap-4 mt-8">
              <a
                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:scale-[1.03] transition"
                href="#"
              >
                Book a demo
              </a>
              <a
                className="px-6 py-3 rounded-lg border font-semibold hover:bg-gray-100 transition"
                href="#features"
              >
                Explore BenefitNest
              </a>
            </div>
          </div>

          <img
            src="/images/marketing/hero-illustration.jpg"
            className="rounded-2xl shadow-2xl hover:scale-[1.02] transition"
            alt="Hero"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                All employee benefits. One secure platform.
              </h2>
              <p className="text-gray-600 mb-6">
                Centralise insurance, benefits, reimbursements, and engagement
                tools so HR teams and employees operate from one system of
                record.
              </p>
            </div>
            <img
              src="/images/marketing/feature-oneplace.jpg"
              className="rounded-2xl shadow-xl hover:scale-[1.02] transition"
              alt=""
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {[
              ["feature-total-reward.jpg", "Total reward"],
              ["feature-insights.jpg", "HR analytics & reporting"],
              ["feature-reimbursement.jpg", "Claims & reimbursements"],
            ].map(([img, title]) => (
              <div
                key={title}
                className="bg-white border rounded-2xl p-6 shadow hover:shadow-2xl hover:-translate-y-1 transition"
              >
                <img
                  src={`/images/marketing/${img}`}
                  className="rounded-lg mb-4 h-44 w-full object-cover"
                  alt=""
                />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">
                  Enterprise-grade capability with employee-friendly experience.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">
            More features and services
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              "feature-integrations.jpg",
              "feature-comms.jpg",
              "feature-support.jpg",
              "feature-consulting.jpg",
            ].map((img) => (
              <div
                key={img}
                className="border rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition"
              >
                <img
                  src={`/images/marketing/${img}`}
                  className="h-36 w-full object-cover rounded-lg mb-4"
                  alt=""
                />
                <h4 className="font-semibold mb-1">Enterprise Capability</h4>
                <p className="text-sm text-gray-600">
                  Designed for scalable corporate operations.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM OVERVIEW */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">How BenefitNest works</h2>
          <p className="text-gray-600 mb-10">
            Everything connected — one employee benefits ecosystem.
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
              <div
                key={img}
                className="bg-white border rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition"
              >
                <img
                  src={`/images/marketing/${img}`}
                  className="h-28 mx-auto object-contain mb-4"
                  alt=""
                />
                <h4 className="font-semibold">Integrated Module</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to simplify employee benefits?
        </h2>
        <p className="mb-6 opacity-90">
          Built for Indian enterprises. Scalable globally.
        </p>
        <a
          className="inline-block px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold hover:scale-105 transition"
          href="#"
        >
          Book a demo
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} BenefitNest. All rights reserved.
      </footer>
</main>

    </>
  );
}
