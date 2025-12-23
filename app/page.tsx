"use client";

export default function Page() {
  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <img src="/images/marketing/logo.png" className="h-10" alt="BenefitNest" />

          <nav className="hidden md:flex gap-8 font-semibold text-gray-700">
            <a className="hover:text-blue-600">Platform</a>
            <a className="hover:text-blue-600">Features</a>
            <a className="hover:text-blue-600">Services</a>
            <a className="hover:text-blue-600">Customers</a>
            <a className="hover:text-blue-600">Resources</a>
          </nav>

          <div className="flex gap-3">
            <a
              href="https://admin.benefitnest.space/admin"
              className="px-4 py-2 rounded-lg border font-semibold hover:shadow-md"
            >
              Admin Login
            </a>
            <a className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-lg">
              Book a demo
            </a>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block mb-4 px-4 py-1 text-xs font-bold bg-blue-100 text-blue-600 rounded-full">
              Enterprise employee benefits platform
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Run, manage, and engage your employees in benefits — anywhere in the world.
            </h1>

            <p className="text-gray-600 text-lg max-w-xl">
              Manage insurance, enrolment, claims, analytics and engagement from a single secure platform.
            </p>

            <div className="mt-8 flex gap-4">
              <a className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-xl">
                Book a demo
              </a>
              <a className="px-6 py-3 border rounded-lg font-semibold hover:shadow-md">
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

      {/* ================= FEATURE GRID ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                All employee benefits. One secure platform.
              </h2>
              <p className="text-gray-600 mb-6">
                Centralise insurance, reimbursements and engagement tools.
              </p>
              <a className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-lg">
                Learn more
              </a>
            </div>

            <img
              src="/images/marketing/feature-oneplace.jpg"
              className="rounded-xl shadow-lg hover:scale-[1.02] transition"
              alt="One platform"
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
                className="group bg-white border rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="h-44 flex items-center justify-center mb-4 overflow-hidden">
                  <img
                    src={`/images/marketing/${img}`}
                    className="h-full object-contain group-hover:scale-105 transition"
                    alt={title}
                  />
                </div>
                <h3 className="font-semibold">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MORE FEATURES ================= */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">More features & services</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["feature-integrations.jpg", "Automation & integrations"],
              ["feature-comms.jpg", "Communications"],
              ["feature-support.jpg", "Administration & support"],
              ["feature-consulting.jpg", "Benefit consulting"],
            ].map(([img, title]) => (
              <div
                key={title}
                className="group bg-white border rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="h-36 flex items-center justify-center mb-4">
                  <img
                    src={`/images/marketing/${img}`}
                    className="h-full object-contain group-hover:scale-105 transition"
                    alt={title}
                  />
                </div>
                <h4 className="font-semibold">{title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">How BenefitNest works</h2>
          <p className="text-gray-600 mb-12">
            Insurance, benefits, engagement and analytics in one hub.
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
                className="group bg-white border rounded-xl p-6 text-center hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="h-40 flex items-center justify-center mb-4">
                  <img
                    src={`/images/marketing/${img}`}
                    className="h-full object-contain group-hover:scale-105 transition"
                    alt={title}
                  />
                </div>
                <h4 className="font-semibold">{title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to simplify employee benefits?
        </h2>
        <a className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-xl">
          Book a demo
        </a>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © {new Date().getFullYear()} BenefitNest. All rights reserved.
      </footer>
    </>
  );
}
