export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#0b1220]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-16 py-6 border-b">
        <h1 className="text-2xl font-bold tracking-tight">
          BenefitNest
        </h1>

        <a
          href="/admin"
          className="px-5 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-100"
        >
          Admin Login
        </a>
      </header>

      {/* HERO */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 px-16 py-24 items-center">
        <div>
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Enterprise Employee Benefits,
            <span className="block text-blue-600">
              Built for Scale
            </span>
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-xl">
            A modern platform to manage employee insurance, benefits,
            enrollments, analytics, and compliance — securely and in one place.
          </p>

          <div className="flex gap-4">
            <a
              href="/request-demo"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Request Demo
            </a>

            <a
              href="/admin"
              className="border px-6 py-3 rounded-lg font-medium hover:bg-gray-100"
            >
              Go to Admin Portal
            </a>
          </div>
        </div>

        <div>
          <img
            src="/images/marketing/hero-enterprise-benefits.jpg"
            alt="Enterprise Benefits Dashboard"
            className="rounded-xl shadow-2xl w-full"
          />
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="px-16 py-12 border-t text-center">
        <p className="text-sm text-gray-500">
          Trusted by HR & Benefits teams across enterprises
        </p>
      </section>
    </main>
  );
}
