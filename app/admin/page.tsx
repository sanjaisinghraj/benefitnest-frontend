export default function AdminLanding() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-8 text-center">
        <img
          src="/images/marketing/admin-login-illustration.jpg"
          alt="Admin Login"
          className="rounded-lg mb-6"
        />

        <h1 className="text-2xl font-bold">BenefitNest Admin</h1>

        <p className="text-gray-600 mt-2">
          Secure access for corporate administrators.
        </p>

        <div className="mt-6 space-y-3">
          <a
            href="/admin/login"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Login as Admin
          </a>

          <button
            disabled
            className="block w-full border border-gray-300 py-3 rounded-lg text-gray-400 cursor-not-allowed"
          >
            Employee Login (Coming Soon)
          </button>
        </div>
      </div>
    </main>
  );
}
