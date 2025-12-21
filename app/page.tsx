import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* NAV */}
      <header className="flex items-center justify-between px-10 py-6 border-b">
        <h1 className="text-2xl font-bold">BenefitNest</h1>
        <Link
          href="https://admin.benefitnest.space"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Admin Login
        </Link>
      </header>

      {/* HERO */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 px-10 py-20 items-center">
        <div>
          <h2 className="text-5xl font-extrabold leading-tight">
            Enterprise Employee Benefits <br /> Reimagined
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            Simplify insurance, wellness, analytics, and compliance — all in one
            secure, multi-tenant platform.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="https://admin.benefitnest.space"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-6 py-3 rounded-lg border font-semibold"
            >
              Explore Platform
            </a>
          </div>
        </div>

        <img
          src="/images/marketing/hero-enterprise-benefits.jpg"
          alt="Enterprise Benefits"
          className="rounded-xl shadow-lg"
        />
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-slate-50 py-20 px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Feature
            title="Smart Enrollment"
            img="/images/marketing/employee-enrollment-flow.jpg"
          />
          <Feature
            title="Enterprise Analytics"
            img="/images/marketing/enterprise-analytics.jpg"
          />
          <Feature
            title="Secure Platform"
            img="/images/marketing/enterprise-security.jpg"
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, img }: { title: string; img: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <img src={img} alt={title} className="rounded-lg mb-4" />
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
  );
}
