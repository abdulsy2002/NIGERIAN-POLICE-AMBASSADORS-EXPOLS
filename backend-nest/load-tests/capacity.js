import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || '').replace(/\/$/, '');
const targetEnv = (__ENV.TARGET_ENV || '').toLowerCase();
const confirmation = __ENV.LOAD_TEST_CONFIRM || '';
const adminToken = __ENV.ADMIN_TOKEN;
const profiles = {
  smoke: [{ duration: '30s', target: 1 }],
  baseline: [
    { duration: '1m', target: 5 },
    { duration: '2m', target: 5 },
    { duration: '1m', target: 0 },
  ],
  capacity: [
    { duration: '2m', target: 10 },
    { duration: '3m', target: 25 },
    { duration: '3m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  soak: [
    { duration: '2m', target: 20 },
    { duration: '30m', target: 20 },
    { duration: '2m', target: 0 },
  ],
};

if (!baseUrl) throw new Error('BASE_URL is required');
const target = new URL(baseUrl);
if (
  !['http:', 'https:'].includes(target.protocol)
  || !['local', 'staging'].includes(targetEnv)
  || target.hostname.toLowerCase().includes('prod')
) {
  throw new Error('TARGET_ENV must be local or staging, and production hosts are not allowed');
}
if (confirmation !== 'I_HAVE_APPROVAL_FOR_NON_PRODUCTION') {
  throw new Error('Set LOAD_TEST_CONFIRM only after confirming the target is approved and non-production');
}

const profile = __ENV.LOAD_PROFILE || 'smoke';
if (!profiles[profile]) throw new Error('LOAD_PROFILE must be smoke, baseline, capacity, or soak');

export const options = {
  stages: profiles[profile],
  thresholds: {
    http_req_failed: ['rate<0.005'],
    http_req_duration: ['p(95)<1000', 'p(99)<3000'],
  },
};

export default function () {
  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  const requests = [
    ['health', `${baseUrl}/health`],
    ['payment-settings', `${baseUrl}/payments/settings?stateBaseCode=NAT`],
    ['reunion-settings', `${baseUrl}/reunion/settings?stateBaseCode=NAT`],
    ['gallery', `${baseUrl}/gallery?stateBaseCode=NAT&page=1&pageSize=20`],
  ];

  if (adminToken) {
    requests.push(
      ['admin-summary', `${baseUrl}/admin/summary`],
      ['admin-alumni', `${baseUrl}/admin/alumni?page=1&pageSize=25`],
      ['admin-broadcasts', `${baseUrl}/admin/broadcasts?page=1&pageSize=20`],
    );
  }

  for (const [name, url] of requests) {
    const response = http.get(url, { headers, timeout: '10s', tags: { endpoint: name } });
    check(response, { [`${name} returned HTTP 200`]: (result) => result.status === 200 });
  }
  sleep(2);
}
