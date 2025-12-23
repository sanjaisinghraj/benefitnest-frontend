"use client";

import React from "react";

export default function Page() {
  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between h-20">
          <a href="/" className="block">
            <img src="/images/marketing/logo.png" alt="BenefitNest" className="h-10" />
          </a>

          <nav className="hidden md:flex gap-7 font-semibold">
            <a href="#" className="hover:text-blue-600">Platform</a>
            <a href="#" className="hover:text-blue-600">Features</a>
            <a href="#" className="hover:text-blue-600">Services</a>
            <a href="#" className="hover:text-blue-600">Customers</a>
            <a href="#" className="hover:text-blue-600">Resources</a>
          </nav>

          <div className="flex gap-3">
            <a
              href="https://admin.benefitnest.space/admin"
              className="px-4 py-2 rounded-lg font-semibold border border-gray-300 text-gray-900 hover:shadow-md"
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
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4">
              Enterprise employee benefits platform
            </span>
            <h1 className="text-5xl font-bold leading-tight mb-5">
              Run, manage, and engage your employees in benefits — anywhere in the world.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              BenefitNest helps organisations manage employee insurance, benefits enrolment, claims, and analytics through a single secure platform.
            </p>
            <div className="flex gap-4 mt-6">
              <a className="px-5 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:shadow-lg" href="#">
                Book a demo
              </a>
              <a className="px-5 py-3 rounded-lg font-semibold border border-gray-300 text-gray-900 hover:shadow-md" href="#features">
                Explore BenefitNest
              </a>
            </div>
          </div>
          <div>
            <img
              src="/images/marketing/hero-illustration.jpg"
              alt="Employee benefits platform overview"
              className="rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">All employee benefits. One secure platform.</h2>
              <p className="text-gray-600 mb-6">
                Centralise insurance, benefits, reimbursements, and engagement tools so HR teams and employees operate from one system of record.
              </p>
              <a className="px-5 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:shadow-lg" href="#">
                Learn more
              </a>
            </div>
            <img src="/images/marketing/feature-oneplace.jpg" alt="One place, all benefits" className="rounded-xl shadow-lg" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {/* Feature cards */}
            <div className="bg-white border rounded-xl p-6 shadow hover:shadow-lg">
              <img src="/images/marketing/feature-total-reward.jpg" alt="Total compensation visibility" className="rounded-lg mb-3" />
              <h3 className="font-semibold mb-1">Total reward</h3>
              <p className="text-gray-600 text-sm">Unified view of insurance, benefits, and employer contributions for employees.</p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow hover:shadow-lg">
              <img src="/images/marketing/feature-insights.jpg" alt="Insights" className="rounded-lg mb-3" />
              <h3 className="font-semibold mb-1">HR analytics & reporting</h3>
              <p className="text-gray-600 text-sm">Actionable insights on enrolment, claims, and benefit utilisation.</p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow hover:shadow-lg">
              <img src="/images/marketing/feature-reimbursement.jpg" alt="Reimbursement accounts" className="rounded-lg mb-3" />
              <h3 className="font-semibold mb-1">Claims & reimbursements</h3>
              <p className="text-gray-600 text-sm">Digitised, policy-based reimbursement and claims processing.</p>
            </div>
            {/* Add remaining cards similarly */}
          </div>
        </div>
      </section>

      {/* PLATFORM OVERVIEW */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-4">How BenefitNest works</h2>
          <p className="text-gray-600 mb-6">
            BenefitNest connects insurance, benefits, reimbursements, engagement, and analytics into a single HR benefits hub.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-6 text-center">
              <img src="/images/marketing/overview-benefits.jpg" alt="Benefits" className="mx-auto mb-3 rounded-lg" />
              <h4 className="font-semibold">Insurance & benefits</h4>
            </div>
            {/* Add other overview items similarly */}
          </div>
        </div>
      </section>

      {/* CUSTOMER STORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-8">Customer stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow">
              <img src="/images/marketing/story-ocado.jpg" alt="Ocado Group" className="rounded-lg mb-3" />
              <h4 className="font-semibold mb-2">Mid-size Indian enterprise</h4>
              <p className="text-gray-600 text-sm">Celebrate achievements of people worldwide.</p>
            </div>
            {/* Add other stories */}
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-3xl font-bold mb-8">Related resources, events & insights</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow">
              <img src="/images/marketing/res-report-big-benefits.jpg" alt="The Big Benefits Report" className="rounded-lg mb-3" />
              <h4 className="font-semibold">Benefits & Insurance Guide</h4>
            </div>
            {/* Add other resources */}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-3xl font-bold">Ready to simplify employee benefits for your organisation?</h2>
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