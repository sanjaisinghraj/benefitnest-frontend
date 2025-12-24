"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            BenefitNest · Platform Administration
          </p>
        </div>

        <button
          onClick={() => {
            document.cookie =
              "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            router.push("/admin");
          }}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>

      {/* QUICK ACTION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CORPORATES */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Corporates
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Create and manage corporate clients, subdomains and configurations.
          </p>
          <button className="text-blue-600 text-sm font-medium">
            Manage corporates →
          </button>
        </div>

        {/* EMPLOYEES */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Employees
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            View employee data, enrollment status and access control.
          </p>
          <button className="text-blue-600 text-sm font-medium">
            View employees →
          </button>
        </div>

        {/* POLICIES & BENEFITS */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Policies & Benefits
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Configure insurance plans, benefits and eligibility rules.
          </p>
          <button className="text-blue-600 text-sm font-medium">
            Configure benefits →
          </button>
        </div>

        {/* CLAIMS */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Claims
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Monitor claims, status updates and escalations.
          </p>
          <button className="text-blue-600 text-sm font-medium">
            View claims →
          </button>
        </div>

        {/* REPORTS */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Reports & Analytics
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Download operational, claims and enrollment reports.
          </p>
          <button className="text-blue-600 text-sm font-medium">
            View reports →
          </button>
        </div>

        {/* AUDIT */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Audit Logs
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Track admin actions and system activity for compliance.
          </p>
          <button className="text-blue-600 text-sm font-medium">
            View audit logs →
          </button>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-10 text-xs text-slate-500">
        Internal system · Actions are logged · Role-based access enforced
      </div>
    </main>
  );
}
