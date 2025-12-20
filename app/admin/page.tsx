import Image from "next/image";
import Link from "next/link";

export default function AdminLandingPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Enterprise Employee Benefits <br /> Reimagined
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            BenefitNest is a secure, multi-tenant employee benefits platform built
            for modern enterprises. Simplify insurance, engagement, analytics,
            and compliance — all in one powerful system.
          </p>

          <div className="flex gap-4">
            <Link
              href="/admin/login"
              className="px-6 py-3 bg-black text-white rounded-md text-lg hover:bg-gray-800"
            >
              Admin Login
            </Link>

            <a
              href="#platform"
              className="px-6 py-3 border border-gray-300 rounded-md text-lg hover:bg-gray-100"
            >
              Explore Platform
            </a>
          </div>
        </div>

        <Image
          src="/images/marketing/hero-enterprise-benefits.jpg"
          alt="Enterprise benefits platform"
          width={620}
          height={480}
          className="rounded-xl shadow-xl"
        />
      </section>

      {/* PLATFORM OVERVIEW */}
      <section id="platform" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            One Platform. Every Benefit.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <Feature
              title="Admin Control Center"
              desc="Create corporates, manage branding, configure benefits, control access and analytics — all from a single secure admin panel."
              img="/images/marketing/hr-admin-dashboard.jpg"
            />

            <Feature
              title="Smart Employee Enrollment"
              desc="Guided, intuitive enrollment journeys that reduce HR workload and improve employee decision-making."
              img="/images/marketing/employee-enrollment-flow.jpg"
            />

            <Feature
              title="Enterprise Analytics"
              desc="Actionable insights on utilization, claims, costs, and engagement with real-time dashboards."
              img="/images/marketing/enterprise-analytics.jpg"
            />
          </div>
        </div>
      </section>

      {/* AI & WELLNESS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <Image
            src="/images/marketing/ai-benefits-insights.jpg"
            alt="AI driven benefits intelligence"
            width={600}
            height={460}
            className="rounded-xl shadow-lg"
          />

          <div>
            <h2 className="text-4xl font-bold mb-6">Intelligence Built In</h2>

            <p className="text-lg text-gray-600 mb-6">
              BenefitNest uses intelligent automation and AI-driven insights to
              personalize benefits, predict trends, and guide better decisions
              for HR teams and employees.
            </p>

            <ul className="space-y-3 text-lg">
              <li>✔ Personalized benefit recommendations</li>
              <li>✔ Predictive cost & utilization insights</li>
              <li>✔ Wellness engagement intelligence</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECURITY & MULTI TENANT */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <Feature
            title="Enterprise Security"
            desc="End-to-end encryption, role-based access, and compliance-first architecture."
            img="/images/marketing/enterprise-security.jpg"
          />

          <Feature
            title="Multi-Tenant Architecture"
            desc="Each corporate runs in an isolated, secure environment with custom branding."
            img="/images/marketing/multi-tenant-platform.jpg"
          />

          <Feature
            title="Mobile Ready Experience"
            desc="Seamless benefits access for employees on mobile and web."
            img="/images/marketing/mobile-benefits-app.jpg"
          />
        </div>
      </section>
    </main>
  );
}

/* ---------- Feature Card ---------- */
function Feature({
  title,
  desc,
  img,
}: {
  title: string;
  desc: string;
  img: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <Image
        src={img}
        alt={title}
        width={320}
        height={220}
        className="mx-auto mb-6 rounded-md"
      />
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
