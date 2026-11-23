import "dotenv/config";

import pool from "../src/config/database.js";
import { createEmbedding } from "../src/services/rag.service.js";
import { geminiConfig } from "../src/config/gemini.js";

const question = "리벨리온이 SK텔레콤에 공급한 서버는 몇 대인가요?";

const main = async () => {
  try {
    console.log("====================================");
    console.log("RAG 검색 유사도 진단");
    console.log("====================================");

    console.log("\n질문:", question);

    // 질문 임베딩 생성
    const embedding = await createEmbedding(question, "RETRIEVAL_QUERY");

    const vectorValue = `[${embedding.join(",")}]`;

    // 최소 유사도 제한 없이 상위 10개 검색
    const result = await pool.query(
      `
        SELECT
          rd.post_id,
          rd.title,
          LEFT(rd.content, 300) AS excerpt,
          rd.embedding_model,
          rd.source_updated_at,
          p.updated_at AS post_updated_at,
          1 - (rd.embedding <=> $1::vector) AS similarity
        FROM rag_documents rd
        INNER JOIN posts p
          ON p.id = rd.post_id
        WHERE rd.embedding IS NOT NULL
        ORDER BY rd.embedding <=> $1::vector ASC
        LIMIT 10
      `,
      [vectorValue],
    );

    console.log("\n========== 검색 결과 ==========");

    if (result.rows.length === 0) {
      console.log("검색할 RAG 문서가 없습니다.");
    }

    result.rows.forEach((document, index) => {
      console.log(`\n[${index + 1}]`);
      console.log("제목:", document.title);
      console.log("유사도:", Number(document.similarity).toFixed(6));
      console.log("게시글 ID:", document.post_id);
      console.log("임베딩 모델:", document.embedding_model);
      console.log("원본 수정일:", document.post_updated_at);
      console.log("임베딩 기준일:", document.source_updated_at);
      console.log("내용:", document.excerpt);
    });

    console.log("\n임베딩 모델:", geminiConfig.embeddingModel);
  } catch (error) {
    console.error("[RAG 진단 실패]", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

await main();
