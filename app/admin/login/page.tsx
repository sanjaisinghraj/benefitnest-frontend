"use client";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/marketing/logo.png"
            alt="BenefitNest"
            className="h-10 mb-3"
          />
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Secure access for authorised administrators only
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@benefitnest.space"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Secure Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} BenefitNest · Admin Portal
        </div>
      </div>
    </div>
  );
}
