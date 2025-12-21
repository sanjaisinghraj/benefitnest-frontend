export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold text-slate-900">BenefitNest</h1>
        <a
          href="https://admin.benefitnest.space/admin"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Admin Login
        </a>
      </header>

      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 px-10 py-20 items-center">
        <div>
          <h2 className="text-5xl font-bold text-slate-900 leading-tight">
            Enterprise Employee Benefits, <br /> Reimagined
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            A modern, secure platform for managing employee insurance,
            benefits, analytics, and compliance — all in one place.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="https://admin.benefitnest.space/admin"
              className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
            >
              Go to Admin Portal
            </a>
            <button className="rounded-xl border border-slate-300 px-6 py-3 text-slate-700">
              Request Demo
            </button>
          </div>
        </div>

        <div>
          <img
            src="/images/marketing/hero-enterprise-benefits.jpg"
            alt="Enterprise Benefits Platform"
            className="rounded-2xl shadow-xl"
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 px-10">
        <h3 className="text-center text-3xl font-bold text-slate-900">
          One Platform. Every Benefit.
        </h3>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Enrollment",
              img: "/images/marketing/employee-enrollment-flow.jpg",
              desc: "Simple guided journeys that reduce HR workload.",
            },
            {
              title: "Enterprise Analytics",
              img: "/images/marketing/enterprise-analytics.jpg",
              desc: "Real-time dashboards for claims, costs and usage.",
            },
            {
              title: "AI Insights",
              img: "/images/marketing/ai-benefits-insights.jpg",
              desc: "Predict trends and personalize benefits.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border p-6">
              <img
                src={item.img}
                className="rounded-xl mb-4"
                alt={item.title}
              />
              <h4 className="text-xl font-semibold">{item.title}</h4>
              <p className="mt-2 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
