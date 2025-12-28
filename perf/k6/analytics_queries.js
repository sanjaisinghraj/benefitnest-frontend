import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  scenarios: {
    analytics: {
      executor: 'constant-vus',
      vus: 40,
      duration: '10m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://review-app/api';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;
const tenants = ['tenantA', 'tenantB', 'tenantC'];

export default function () {
  const tenantId = tenants[Math.floor(Math.random() * tenants.length)];
  const from = '2025-01-01';
  const to = '2025-12-31';
  const url = `${BASE_URL}/analytics/costFacts?tenantId=${tenantId}&from=${from}&to=${to}`;
  const params = {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };
  const res = http.get(url, params);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has costFacts': (r) => Array.isArray(r.json().costFacts),
  });
  sleep(1);
}
