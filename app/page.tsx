export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Enterprise Employee Benefits
            <span className="text-blue-600"> Reimagined</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            BenefitNest is a secure, modern employee benefits platform designed
            for enterprises to manage insurance, wellness, analytics and
            compliance in one place.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="https://admin.benefitnest.space"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Admin Login
            </a>

            <a
              href="#features"
              className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Explore Platform
            </a>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div>
          <img
            src="/images/marketing/hero-enterprise-benefits.jpg"
            alt="Enterprise Benefits Platform"
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="bg-gray-50 py-20 px-6"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <Feature
            title="Smart Enrollment"
            desc="Simple, guided enrollment journeys that reduce HR workload."
            img="/images/marketing/employee-enrollment-flow.jpg"
          />
          <Feature
            title="Enterprise Analytics"
            desc="Real-time dashboards for claims, utilization and costs."
            img="/images/marketing/enterprise-analytics.jpg"
          />
          <Feature
            title="Secure & Scalable"
            desc="Multi-tenant architecture with enterprise-grade security."
            img="/images/marketing/enterprise-security.jpg"
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
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <img src={img} alt={title} className="rounded-lg mb-4" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  );
}
