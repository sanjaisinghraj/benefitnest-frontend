'use client';

export default function AIReviewDrawer() {
  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-96 border-l bg-white hidden">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-2">AI Review</h3>

        <p className="text-sm text-gray-600">
          AI validation results will appear here.
        </p>
      </div>
    </div>
  );
}
