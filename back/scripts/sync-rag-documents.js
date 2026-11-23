import "dotenv/config";

import pool from "../src/config/database.js";

import {
  findPostsNeedingEmbedding,
  countRagDocuments,
} from "../src/repositories/rag.repository.js";

import { syncPostEmbedding } from "../src/services/rag.service.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  console.log("====================================");
  console.log("RAG 게시글 임베딩 동기화 시작");
  console.log("====================================");

  let successCount = 0;
  let failureCount = 0;

  try {
    const posts = await findPostsNeedingEmbedding();

    console.log(`\n임베딩 대상 게시글: ${posts.length}개`);

    if (posts.length === 0) {
      console.log("동기화할 게시글이 없습니다.");
    }

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      console.log(`\n[${i + 1}/${posts.length}] ${post.title}`);

      try {
        await syncPostEmbedding(post);

        successCount++;

        console.log("임베딩 저장 성공");
      } catch (error) {
        failureCount++;

        console.error("임베딩 실패:", error.message);
      }

      // API 요청 간격 확보
      if (i < posts.length - 1) {
        await sleep(500);
      }
    }

    const totalDocuments = await countRagDocuments();

    console.log("\n====================================");
    console.log("RAG 동기화 결과");
    console.log("====================================");

    console.log(`전체 대상: ${posts.length}개`);
    console.log(`성공: ${successCount}개`);
    console.log(`실패: ${failureCount}개`);
    console.log(`현재 RAG 문서: ${totalDocuments}개`);

    console.log("\nRAG 동기화 작업 종료");
  } catch (error) {
    console.error("\nRAG 동기화 작업 실패:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

await main();
