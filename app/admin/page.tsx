export default function AdminPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Enterprise Employee Benefits <br /> Reimagined
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            BenefitNest is a secure, multi-tenant employee benefits platform
            built for modern enterprises. Simplify insurance, engagement,
            analytics, and compliance — all in one powerful system.
          </p>

          <div className="flex gap-4">
            <a
              href="/admin/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Admin Login
            </a>

            <a
              href="#platform"
              className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Explore Platform
            </a>
          </div>
        </div>

        <img
          src="/images/marketing/hero-enterprise-benefits.jpg"
          alt="Enterprise Benefits Platform"
          className="rounded-xl shadow-lg"
        />
      </section>

      {/* PLATFORM OVERVIEW */}
      <section id="platform" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">
            One Platform. Every Benefit.
          </h2>
          <p className="text-gray-600 mb-12 max-w-3xl">
            BenefitNest brings together employee insurance, wellness,
            communication, analytics, and compliance into a single,
            enterprise-grade platform.
          </p>

          <img
            src="/images/marketing/platform-overview.jpg"
            alt="Platform Overview"
            className="rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16">
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

        <Feature
          title="Intelligence Built In"
          desc="AI-driven insights to personalize benefits, predict trends, and guide better decisions for HR teams and employees."
          img="/images/marketing/ai-benefits-insights.jpg"
        />
      </section>

      {/* SECURITY */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Enterprise-Grade Security
            </h2>
            <p className="text-gray-300 mb-4">
              Multi-tenant isolation, encrypted data, role-based access,
              audit trails, and compliance-ready architecture.
            </p>
          </div>

          <img
            src="/images/marketing/enterprise-security.jpg"
            alt="Enterprise Security"
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>
    </main>
  );
}

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
    <div className="flex flex-col gap-4">
      <img src={img} alt={title} className="rounded-lg shadow-md" />
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
