export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-slate-900">
          Admin Login
        </h1>
        <p className="text-center text-slate-600 mt-2">
          Authorized administrators only
        </p>

        <form className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="admin@benefitnest.space"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium hover:bg-blue-700"
          >
            Secure Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          © 2025 BenefitNest
        </p>
      </div>
    </main>
  );
}
