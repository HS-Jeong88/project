import "dotenv/config";

import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";

import app from "../src/app.js";
import pool from "../src/config/database.js";

const API = "/api/v1";
const PASSWORD = "Test1234!";

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

test("게시판 API 통합 테스트", async (t) => {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);

  const accounts = [
    {
      email: `api_test_a_${suffix}@example.com`,
      nickname: `API테스트A${suffix}`,
      id: null,
      token: null,
    },
    {
      email: `api_test_b_${suffix}@example.com`,
      nickname: `API테스트B${suffix}`,
      id: null,
      token: null,
    },
    {
      email: `api_test_admin_${suffix}@example.com`,
      nickname: `API관리자${suffix}`,
      id: null,
      token: null,
    },
  ];

  let postId = null;
  let adminPostId = null;
  let commentId = null;

  try {
    // --------------------------------------------------
    // 1. 테스트 계정 생성
    // --------------------------------------------------

    for (const account of accounts) {
      const response = await request(app).post(`${API}/auth/register`).send({
        email: account.email,
        password: PASSWORD,
        nickname: account.nickname,
      });

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);

      account.id = response.body.data.user.id;
    }

    // 세 번째 계정을 테스트용 ADMIN으로 승격
    await pool.query(
      `
            UPDATE users
            SET role = 'ADMIN',
                status = 'ACTIVE'
            WHERE id = $1
            `,
      [accounts[2].id],
    );

    // 계정별 로그인 및 Access Token 확보
    for (const account of accounts) {
      const response = await request(app).post(`${API}/auth/login`).send({
        email: account.email,
        password: PASSWORD,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);

      account.token = response.body.data.accessToken;
    }

    const userA = accounts[0];
    const userB = accounts[1];
    const admin = accounts[2];

    // --------------------------------------------------
    // 2. 인증 API 테스트
    // --------------------------------------------------

    await t.test("로그인한 사용자의 내 정보 조회", async () => {
      const response = await request(app).get(`${API}/auth/me`).set(authHeader(userA.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.user.id, userA.id);
    });

    await t.test("인증 토큰 없이 내 정보 조회 시 거부", async () => {
      const response = await request(app).get(`${API}/auth/me`);

      assert.equal(response.status, 401);
    });

    // --------------------------------------------------
    // 3. 게시글 CRUD 테스트
    // --------------------------------------------------

    await t.test("게시글 작성", async () => {
      const response = await request(app)
        .post(`${API}/posts`)
        .set(authHeader(userA.token))
        .send({
          title: `통합 테스트 게시글 ${suffix}`,
          content: "자동화 테스트로 생성한 게시글입니다.",
        });

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);

      postId = response.body.data.post.id;
    });

    await t.test("게시글 목록 및 페이지네이션", async () => {
      const response = await request(app).get(`${API}/posts?page=1&limit=10`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(Array.isArray(response.body.data.posts));
      assert.ok(response.body.data.pagination);
      assert.equal(response.body.data.pagination.page, 1);
    });

    await t.test("게시글 검색", async () => {
      const response = await request(app).get(
        `${API}/posts?keyword=${encodeURIComponent(suffix)}&searchType=title`,
      );

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);

      const found = response.body.data.posts.some((post) => post.id === postId);

      assert.equal(found, true);
    });

    await t.test("게시글 상세 조회", async () => {
      const response = await request(app).get(`${API}/posts/${postId}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.post.id, postId);
    });

    await t.test("작성자 본인의 게시글 수정", async () => {
      const response = await request(app)
        .patch(`${API}/posts/${postId}`)
        .set(authHeader(userA.token))
        .send({
          title: `수정된 통합 테스트 게시글 ${suffix}`,
          content: "게시글 수정 테스트입니다.",
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });

    await t.test("다른 사용자의 게시글 수정 거부", async () => {
      const response = await request(app)
        .patch(`${API}/posts/${postId}`)
        .set(authHeader(userB.token))
        .send({
          title: "권한 없는 수정 시도",
          content: "수정할 수 없어야 합니다.",
        });

      assert.equal(response.status, 403);
    });

    // --------------------------------------------------
    // 4. 댓글 CRUD 및 권한 테스트
    // --------------------------------------------------

    await t.test("댓글 작성", async () => {
      const response = await request(app)
        .post(`${API}/posts/${postId}/comments`)
        .set(authHeader(userA.token))
        .send({
          content: "통합 테스트 댓글입니다.",
        });

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);

      commentId = response.body.data.comment.id;
    });

    await t.test("댓글 목록 조회 및 페이지네이션", async () => {
      const response = await request(app).get(`${API}/posts/${postId}/comments?page=1&limit=10`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(Array.isArray(response.body.data.comments));
      assert.ok(response.body.data.pagination);
    });

    await t.test("댓글 작성자 본인의 댓글 수정", async () => {
      const response = await request(app)
        .patch(`${API}/comments/${commentId}`)
        .set(authHeader(userA.token))
        .send({
          content: "수정된 통합 테스트 댓글입니다.",
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });

    await t.test("다른 사용자의 댓글 수정 거부", async () => {
      const response = await request(app)
        .patch(`${API}/comments/${commentId}`)
        .set(authHeader(userB.token))
        .send({
          content: "권한 없는 수정 시도",
        });

      assert.equal(response.status, 403);
    });

    await t.test("다른 사용자의 댓글 삭제 거부", async () => {
      const response = await request(app)
        .delete(`${API}/comments/${commentId}`)
        .set(authHeader(userB.token));

      assert.equal(response.status, 403);
    });

    // --------------------------------------------------
    // 5. 관리자 권한 테스트
    // --------------------------------------------------

    await t.test("관리자 API 접근 성공", async () => {
      const response = await request(app).get(`${API}/admin/check`).set(authHeader(admin.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });

    await t.test("일반 사용자의 관리자 API 접근 거부", async () => {
      const response = await request(app).get(`${API}/admin/users`).set(authHeader(userA.token));

      assert.equal(response.status, 403);
    });

    await t.test("관리자 사용자 목록 조회", async () => {
      const response = await request(app)
        .get(`${API}/admin/users?page=1&limit=10`)
        .set(authHeader(admin.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(Array.isArray(response.body.data.users));
      assert.ok(response.body.data.pagination);
    });

    await t.test("관리자 사용자 검색", async () => {
      const response = await request(app)
        .get(`${API}/admin/users?search=${encodeURIComponent(userA.email)}`)
        .set(authHeader(admin.token));

      assert.equal(response.status, 200);

      const found = response.body.data.users.some((user) => user.id === userA.id);

      assert.equal(found, true);
    });

    await t.test("관리자 사용자 상세 조회", async () => {
      const response = await request(app)
        .get(`${API}/admin/users/${userA.id}`)
        .set(authHeader(admin.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.user.id, userA.id);
    });

    await t.test("관리자가 사용자 역할 변경 및 복구", async () => {
      const promoteResponse = await request(app)
        .patch(`${API}/admin/users/${userA.id}/role`)
        .set(authHeader(admin.token))
        .send({
          role: "ADMIN",
        });

      assert.equal(promoteResponse.status, 200);
      assert.equal(promoteResponse.body.data.user.role, "ADMIN");

      const restoreResponse = await request(app)
        .patch(`${API}/admin/users/${userA.id}/role`)
        .set(authHeader(admin.token))
        .send({
          role: "USER",
        });

      assert.equal(restoreResponse.status, 200);
      assert.equal(restoreResponse.body.data.user.role, "USER");
    });

    await t.test("관리자가 사용자 정지 및 복구", async () => {
      const suspendResponse = await request(app)
        .patch(`${API}/admin/users/${userB.id}/status`)
        .set(authHeader(admin.token))
        .send({
          status: "SUSPENDED",
        });

      assert.equal(suspendResponse.status, 200);
      assert.equal(suspendResponse.body.data.user.status, "SUSPENDED");

      const blockedResponse = await request(app).get(`${API}/auth/me`).set(authHeader(userB.token));

      assert.equal(blockedResponse.status, 403);

      const restoreResponse = await request(app)
        .patch(`${API}/admin/users/${userB.id}/status`)
        .set(authHeader(admin.token))
        .send({
          status: "ACTIVE",
        });

      assert.equal(restoreResponse.status, 200);
      assert.equal(restoreResponse.body.data.user.status, "ACTIVE");
    });

    // --------------------------------------------------
    // 6. 관리자 게시글 / 댓글 관리
    // --------------------------------------------------

    await t.test("관리자 게시글 및 댓글 목록 조회", async () => {
      const postsResponse = await request(app)
        .get(`${API}/admin/posts?page=1&limit=10`)
        .set(authHeader(admin.token));

      assert.equal(postsResponse.status, 200);
      assert.ok(Array.isArray(postsResponse.body.data.posts));

      const commentsResponse = await request(app)
        .get(`${API}/admin/comments?page=1&limit=10`)
        .set(authHeader(admin.token));

      assert.equal(commentsResponse.status, 200);
      assert.ok(Array.isArray(commentsResponse.body.data.comments));
    });

    await t.test("관리자의 댓글 삭제", async () => {
      const response = await request(app)
        .delete(`${API}/admin/comments/${commentId}`)
        .set(authHeader(admin.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });

    await t.test("관리자의 게시글 삭제", async () => {
      const createResponse = await request(app)
        .post(`${API}/posts`)
        .set(authHeader(userA.token))
        .send({
          title: `관리자 삭제 테스트 ${suffix}`,
          content: "관리자 삭제 테스트용 게시글입니다.",
        });

      assert.equal(createResponse.status, 201);
      adminPostId = createResponse.body.data.post.id;

      const response = await request(app)
        .delete(`${API}/admin/posts/${adminPostId}`)
        .set(authHeader(admin.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });

    await t.test("작성자 본인의 게시글 삭제", async () => {
      const response = await request(app)
        .delete(`${API}/posts/${postId}`)
        .set(authHeader(userA.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });
  } finally {
    // 테스트 계정 및 연결 데이터 정리
    const userIds = accounts.map((account) => account.id).filter(Boolean);

    try {
      if (userIds.length > 0) {
        await pool.query(
          `
                    DELETE FROM users
                    WHERE id = ANY($1::uuid[])
                    `,
          [userIds],
        );
      }
    } finally {
      await pool.end();
    }
  }
});
