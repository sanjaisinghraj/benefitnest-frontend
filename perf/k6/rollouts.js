import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  scenarios: {
    rollouts: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      maxVUs: 100,
      stages: [
        { target: 20, duration: '2m' },
        { target: 50, duration: '3m' },
        { target: 100, duration: '5m' },
        { target: 0, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.015'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://review-app/api';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export default function () {
  // Simulate phased/global rollout toggle
  const rolloutType = Math.random() < 0.7 ? 'phased' : 'global';
  const payload = JSON.stringify({
    feature: 'newBenefit',
    rolloutType,
    progress: Math.floor(Math.random() * 100),
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };
  const res = http.post(`${BASE_URL}/rollouts/toggle`, payload, params);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'progress polled': (r) => r.json().progress !== undefined,
  });
  sleep(1);
}
