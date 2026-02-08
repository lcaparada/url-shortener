import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  vus: 100,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<5000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const createRes = http.post(
    `${BASE_URL}/short-urls`,
    JSON.stringify({ originalUrl: "https://example.com/load-test" }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const createOk = check(createRes, {
    "create status 201": (r) => r.status === 201,
  });

  if (createOk) {
    const body = createRes.json();
    if (body && body.shortCode) {
      const getRes = http.get(`${BASE_URL}/${body.shortCode}`, {
        redirects: 0,
      });
      check(getRes, { "redirect 302": (r) => r.status === 302 });
    }
  }

  sleep(0.5);
}
