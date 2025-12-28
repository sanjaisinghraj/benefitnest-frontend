import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomSeed, weightedRandom } from './utils.js';

export let options = {
  scenarios: {
    enrollments: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { target: 50, duration: '2m' },
        { target: 100, duration: '3m' },
        { target: 200, duration: '5m' },
        { target: 0, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};

const tenants = [
  { id: 'tenantA', weight: 0.5 },
  { id: 'tenantB', weight: 0.3 },
  { id: 'tenantC', weight: 0.2 },
];

const BASE_URL = __ENV.BASE_URL || 'https://review-app/api';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export default function () {
  const tenant = weightedRandom(tenants);
  const payload = JSON.stringify({
    tenantId: tenant.id,
    userId: `user_${__VU}_${__ITER}`,
    planId: 'gmc2025',
    data: { /* ... */ },
    requestId: `${__VU}_${__ITER}` // idempotency
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };
  const res = http.post(`${BASE_URL}/enrollments`, payload, params);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'idempotent': (r) => r.json().requestId === `${__VU}_${__ITER}`,
  });
  sleep(1);
}
