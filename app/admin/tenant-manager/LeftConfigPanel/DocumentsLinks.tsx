'use client';

export default function DocumentsLinks() {
  return (
    <div className="border rounded p-3">
      <h3 className="text-sm font-semibold mb-3">Documents & Links</h3>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Document label"
          className="w-full border rounded px-2 py-1 text-sm"
        />

        <input
          type="text"
          placeholder="Document URL"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
