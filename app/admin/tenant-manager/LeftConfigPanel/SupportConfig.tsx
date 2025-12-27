'use client';

export default function SupportConfig() {
  return (
    <div className="border rounded p-3">
      <h3 className="text-sm font-semibold mb-3">Support</h3>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Enable AI Chatbot
        </label>

        <input
          type="email"
          placeholder="Support email"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
