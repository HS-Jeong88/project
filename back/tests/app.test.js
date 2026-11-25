import "dotenv/config";

import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN?.split(",")[0]?.trim() || "http://localhost:5500";

describe("Swagger Docs", () => {
  it("GET /docs/ 는 Swagger UI HTML을 반환해야 한다", async () => {
    const res = await request(app).get("/docs/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Swagger UI");
  });
});

test("GET /api/v1/health - 서버 정상 응답", async () => {
  const response = await request(app).get("/api/v1/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test("존재하지 않는 API - 404 반환", async () => {
  const response = await request(app).get("/api/v1/test-not-found");

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.code, "NOT_FOUND");
});

test("X-Powered-By 헤더 미노출", async () => {
  const response = await request(app).get("/api/v1/health");

  assert.equal(response.headers["x-powered-by"], undefined);
});

test("Helmet 보안 헤더 적용", async () => {
  const response = await request(app).get("/api/v1/health");

  assert.ok(response.headers["x-content-type-options"]);
  assert.ok(response.headers["x-frame-options"]);
  assert.ok(response.headers["content-security-policy"]);
});

test("허용된 Origin의 CORS 요청", async () => {
  const response = await request(app).get("/api/v1/health").set("Origin", CLIENT_ORIGIN);

  assert.equal(response.status, 200);
  assert.equal(response.headers["access-control-allow-origin"], CLIENT_ORIGIN);
  assert.equal(response.headers["access-control-allow-credentials"], "true");
});

test("허용되지 않은 Origin의 CORS 요청", async () => {
  const response = await request(app)
    .get("/api/v1/health")
    .set("Origin", "http://malicious-example.com");

  assert.equal(response.status, 403);
  assert.equal(response.headers["access-control-allow-origin"], undefined);
  assert.equal(response.body.code, "CORS_ORIGIN_DENIED");
});
