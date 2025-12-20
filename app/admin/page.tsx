import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Enterprise Employee Benefits <br />
              <span className="text-indigo-300">Reimagined</span>
            </h1>

            <p className="text-lg text-slate-200 mb-8">
              BenefitNest is a secure, multi-tenant employee benefits platform
              built for modern enterprises. Simplify insurance, engagement,
              analytics, and compliance — all in one powerful system.
            </p>

            <div className="flex gap-4">
              <Link
                href="/admin/login"
                className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                Admin Login
              </Link>

              <Link
                href="#platform"
                className="border border-white/30 px-6 py-3 rounded-lg hover:bg-white/10 transition"
              >
                Explore Platform
              </Link>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/images/marketing/hero-enterprise-benefits.jpg"
              alt="Enterprise Benefits Platform"
              width={800}
              height={500}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </div>

        </div>
      </section>

      {/* ================= PLATFORM OVERVIEW ================= */}
      <section id="platform" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            One Platform. Every Benefit.
          </h2>

          <p className="max-w-3xl mx-auto text-slate-600 mb-14">
            BenefitNest brings together employee insurance, wellness,
            communication, analytics, and compliance into a single,
            enterprise-grade platform.
          </p>

          <Image
            src="/images/marketing/platform-overview.jpg"
            alt="Platform Overview"
            width={1100}
            height={600}
            className="rounded-xl shadow-xl mx-auto"
          />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12">

          {[
            {
              title: "Admin Control Center",
              img: "hr-admin-dashboard.jpg",
              desc: "Create corporates, manage branding, configure benefits, control access and analytics — all from a single secure admin panel."
            },
            {
              title: "Smart Employee Enrollment",
              img: "employee-enrollment-flow.jpg",
              desc: "Guided, intuitive enrollment journeys that reduce HR workload and improve employee decision-making."
            },
            {
              title: "Enterprise Analytics",
              img: "enterprise-analytics.jpg",
              desc: "Actionable insights on utilization, claims, costs, and engagement with real-time dashboards."
            }
          ].map((item) => (
            <div key={item.title} className="bg-slate-50 rounded-xl p-6 shadow-sm">
              <Image
                src={`/images/marketing/${item.img}`}
                alt={item.title}
                width={400}
                height={300}
                className="rounded-lg mb-6"
              />
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}

        </div>
      </section>

      {/* ================= AI + WELLNESS ================= */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-4xl font-bold mb-6">
              Intelligence Built In
            </h2>

            <p className="text-slate-200 mb-6">
              BenefitNest uses intelligent automation and AI-driven insights
              to personalize benefits, predict trends, and guide better decisions
              for both HR teams and employees.
            </p>

            <ul className="space-y-4 text-slate-200">
              <li>✔ Personalized benefit recommendations</li>
              <li>✔ Predictive cost & utilization insights</li>
              <li>✔ Wellness engagement intelligence</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Image
              src="/images/marketing/ai-benefits-insights.jpg"
              alt="AI Insights"
              width={300}
              height={300}
              className="rounded-xl"
            />
            <Image
              src="/images/marketing/employee-wellness.jpg"
              alt="Employee Wellness"
              width={300}
              height={300}
              className="rounded-xl"
            />
          </div>

        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          <Image
            src="/images/marketing/enterprise-security.jpg"
            alt="Enterprise Security"
            width={600}
            height={500}
            className="rounded-xl shadow-lg"
          />

          <div>
            <h2 className="text-4xl font-bold mb-6">
              Enterprise-Grade Security
            </h2>

            <p className="text-slate-600 mb-6">
              Designed with security, privacy, and compliance at its core.
              BenefitNest protects sensitive employee data with industry-leading
              safeguards.
            </p>

            <ul className="space-y-3 text-slate-700">
              <li>✔ Role-based access control</li>
              <li>✔ Tenant-level data isolation</li>
              <li>✔ Encrypted data & secure infrastructure</li>
              <li>✔ Audit-ready compliance design</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-indigo-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">
            Built for Enterprises. Trusted by HR.
          </h2>

          <p className="text-indigo-200 mb-8">
            Start managing employee benefits with clarity, control, and confidence.
          </p>

          <Link
            href="/admin/login"
            className="inline-block bg-white text-indigo-900 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-100 transition"
          >
            Access Admin Panel
          </Link>
        </div>
      </section>

    </main>
  );
}
