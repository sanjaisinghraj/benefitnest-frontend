export default function AdminLogin() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-slate-600 mb-6">
          Authorized administrators only.
        </p>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="admin@benefitnest.space"
            className="w-full border rounded-lg px-4 py-3"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold"
          >
            Secure Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          © 2025 BenefitNest
        </p>
      </div>
    </main>
  );
}
