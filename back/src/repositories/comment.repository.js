import pool from "../config/database.js";

// 게시글 존재 여부 확인
export const findPostById = async (postId) => {
  const result = await pool.query(
    `
        SELECT id
        FROM posts
        WHERE id = $1
        LIMIT 1
        `,
    [postId],
  );

  return result.rows[0] || null;
};

// 댓글 목록 조회
export const findCommentsByPostId = async ({ postId, offset, limit }) => {
  const result = await pool.query(
    `
        SELECT
            c.id,
            c.post_id,
            c.user_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.nickname AS author_nickname
        FROM comments c
        INNER JOIN users u
            ON c.user_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT $2
        OFFSET $3
        `,
    [postId, limit, offset],
  );

  return result.rows;
};

// 댓글 전체 개수
export const countCommentsByPostId = async (postId) => {
  const result = await pool.query(
    `
        SELECT COUNT(*)::int AS total
        FROM comments
        WHERE post_id = $1
        `,
    [postId],
  );

  return result.rows[0].total;
};

// 댓글 단건 조회
export const findCommentById = async (commentId) => {
  const result = await pool.query(
    `
        SELECT
            c.id,
            c.post_id,
            c.user_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.nickname AS author_nickname
        FROM comments c
        INNER JOIN users u
            ON c.user_id = u.id
        WHERE c.id = $1
        LIMIT 1
        `,
    [commentId],
  );

  return result.rows[0] || null;
};

// 댓글 작성
export const createComment = async ({ postId, userId, content }) => {
  const result = await pool.query(
    `
        INSERT INTO comments (
            post_id,
            user_id,
            content
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            post_id,
            user_id,
            content,
            created_at,
            updated_at
        `,
    [postId, userId, content],
  );

  return result.rows[0];
};

// 댓글 수정
export const updateComment = async ({ commentId, content }) => {
  const result = await pool.query(
    `
        UPDATE comments
        SET
            content = $2,
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            post_id,
            user_id,
            content,
            created_at,
            updated_at
        `,
    [commentId, content],
  );

  return result.rows[0] || null;
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
  const result = await pool.query(
    `
        DELETE FROM comments
        WHERE id = $1
        RETURNING id
        `,
    [commentId],
  );

  return result.rows[0] || null;
};
