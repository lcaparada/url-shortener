/**
 * Teste de carga focado no redirect (GET /:shortCode).
 *
 * Comparar com e sem Redis:
 *   1. Com Redis:  npm run redis:up && npm run dev (em outro terminal) && k6 run scripts/redirect-load-test.js
 *   2. Sem Redis:  npm run redis:down (ou pare o Redis), reinicie o dev e rode de novo
 *
 * Métricas para comparar no final: http_req_duration (avg, p95, p99) e http_reqs (req/s).
 * Com cache, o redirect tende a ter latência menor (Redis em memória vs. consulta ao Postgres).
 */
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  vus: 50,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

// Cria uma URL encurtada uma vez e depois só faz redirects (cache hit após o primeiro)
let shortCode = __ENV.SHORT_CODE;

export function setup() {
  if (shortCode) return { shortCode };
  const res = http.post(
    `${BASE_URL}/short-urls`,
    JSON.stringify({ originalUrl: "https://example.com/redirect-load-test" }),
    { headers: { "Content-Type": "application/json" } },
  );
  if (res.status !== 201) throw new Error("Setup: create short URL failed");
  const body = res.json();
  shortCode = body?.shortCode;
  if (!shortCode) throw new Error("Setup: no shortCode in response");
  return { shortCode };
}

export default function (data) {
  const res = http.get(`${BASE_URL}/${data.shortCode}`, { redirects: 0 });
  check(res, { "redirect 302": (r) => r.status === 302 });
  sleep(0.1);
}
