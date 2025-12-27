'use client';

import { useTenantConfigContext } from '../TenantConfigContext';

export default function WidgetsConfig() {
  const { config, update } = useTenantConfigContext();

  return (
    <div className="border rounded p-3">
      <h3 className="text-sm font-semibold mb-3">Widgets</h3>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.widgets.announcement}
            onChange={(e) =>
              update('widgets.announcement', e.target.checked)
            }
          />
          Announcement Banner
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.widgets.poll}
            onChange={(e) =>
              update('widgets.poll', e.target.checked)
            }
          />
          Poll
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.widgets.survey}
            onChange={(e) =>
              update('widgets.survey', e.target.checked)
            }
          />
          Survey
        </label>
      </div>
    </div>
  );
}
