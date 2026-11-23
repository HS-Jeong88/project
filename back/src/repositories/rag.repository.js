import pool from "../config/database.js";

// 임베딩이 없거나 원본 게시글이 수정된 게시글 조회
export const findPostsNeedingEmbedding = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.user_id,
      p.title,
      p.content,
      p.updated_at
    FROM posts p
    LEFT JOIN rag_documents rd
      ON rd.post_id = p.id
    WHERE
      rd.id IS NULL
      OR rd.source_updated_at IS NULL
      OR rd.source_updated_at < p.updated_at
    ORDER BY p.created_at ASC, p.id ASC
  `);

  return result.rows;
};

// RAG 문서 저장 또는 갱신
export const upsertRagDocument = async ({
  postId,
  userId,
  title,
  content,
  embedding,
  embeddingModel,
  sourceUpdatedAt,
}) => {
  if (!Array.isArray(embedding) || embedding.length !== 768) {
    throw new Error("RAG 임베딩은 768차원 벡터여야 합니다.");
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error("임베딩 벡터에 유효하지 않은 값이 포함되어 있습니다.");
  }

  const vectorValue = `[${embedding.join(",")}]`;

  const result = await pool.query(
    `
      INSERT INTO rag_documents (
        post_id,
        user_id,
        title,
        content,
        embedding,
        embedding_model,
        source_updated_at,
        embedded_at,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5::vector,
        $6,
        $7,
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (post_id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        embedding_model = EXCLUDED.embedding_model,
        source_updated_at = EXCLUDED.source_updated_at,
        embedded_at = NOW(),
        updated_at = NOW()
      WHERE
        rag_documents.source_updated_at IS NULL
        OR rag_documents.source_updated_at <= EXCLUDED.source_updated_at
      RETURNING
        id,
        post_id,
        embedded_at
    `,
    [postId, userId, title, content, vectorValue, embeddingModel, sourceUpdatedAt],
  );

  return result.rows[0] || null;
};

// 질문 임베딩과 유사한 게시글 검색
export const findSimilarRagDocuments = async ({ embedding, limit = 5, minSimilarity = 0.6 }) => {
  if (!Array.isArray(embedding) || embedding.length !== 768) {
    throw new Error("검색 임베딩은 768차원 벡터여야 합니다.");
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error("검색 임베딩에 유효하지 않은 값이 포함되어 있습니다.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    throw new Error("검색 결과 개수가 올바르지 않습니다.");
  }

  if (!Number.isFinite(minSimilarity) || minSimilarity < -1 || minSimilarity > 1) {
    throw new Error("최소 유사도 기준이 올바르지 않습니다.");
  }

  const vectorValue = `[${embedding.join(",")}]`;

  const result = await pool.query(
    `
      SELECT
        id,
        post_id,
        user_id,
        title,
        content,
        source_updated_at,
        1 - (embedding <=> $1::vector) AS similarity
      FROM rag_documents
      WHERE
        embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) >= $2
      ORDER BY embedding <=> $1::vector ASC
      LIMIT $3
    `,
    [vectorValue, minSimilarity, limit],
  );

  return result.rows;
};

// 전체 RAG 문서 개수
export const countRagDocuments = async () => {
  const result = await pool.query(`
    SELECT COUNT(*)::INTEGER AS total
    FROM rag_documents
  `);

  return result.rows[0].total;
};
