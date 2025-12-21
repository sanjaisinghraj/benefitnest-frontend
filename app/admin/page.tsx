import Link from "next/link";

export default function AdminLanding() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <img
          src="/images/marketing/admin-login-illustration.jpg"
          alt="Admin"
          className="rounded-lg mb-6"
        />

        <h1 className="text-2xl font-bold mb-2">BenefitNest Admin</h1>
        <p className="text-slate-600 mb-6">
          Secure access for corporate administrators.
        </p>

        <Link
          href="/admin/login"
          className="block w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Login as Admin
        </Link>

        <button
          disabled
          className="mt-3 w-full py-3 rounded-lg border text-slate-400 cursor-not-allowed"
        >
          Employee Login (Coming Soon)
        </button>
      </div>
    </main>
  );
}
