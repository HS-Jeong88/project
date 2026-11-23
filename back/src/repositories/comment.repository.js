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
// 페이지네이션은 부모 댓글에만 적용
export const findCommentsByPostId = async ({ postId, offset, limit }) => {
  const parentResult = await pool.query(
    `
      SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.parent_comment_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.nickname AS author_nickname
      FROM comments c
      INNER JOIN users u
        ON c.user_id = u.id
      WHERE c.post_id = $1
        AND c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT $2
      OFFSET $3
    `,
    [postId, limit, offset],
  );

  const parentComments = parentResult.rows;

  if (parentComments.length === 0) {
    return [];
  }

  const parentIds = parentComments.map((comment) => comment.id);

  // 현재 페이지에 포함된 부모 댓글들의 답글 조회
  const replyResult = await pool.query(
    `
      SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.parent_comment_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.nickname AS author_nickname
      FROM comments c
      INNER JOIN users u
        ON c.user_id = u.id
      WHERE c.parent_comment_id = ANY($1::uuid[])
      ORDER BY c.created_at ASC, c.id ASC
    `,
    [parentIds],
  );

  const repliesByParentId = new Map();

  for (const reply of replyResult.rows) {
    const parentId = reply.parent_comment_id;

    if (!repliesByParentId.has(parentId)) {
      repliesByParentId.set(parentId, []);
    }

    repliesByParentId.get(parentId).push(reply);
  }

  return parentComments.map((comment) => ({
    ...comment,
    replies: repliesByParentId.get(comment.id) || [],
  }));
};

// 부모 댓글 전체 개수
export const countCommentsByPostId = async (postId) => {
  const result = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM comments
      WHERE post_id = $1
        AND parent_comment_id IS NULL
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
        c.parent_comment_id,
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
export const createComment = async ({ postId, userId, content, parentCommentId = null }) => {
  const result = await pool.query(
    `
      INSERT INTO comments (
        post_id,
        user_id,
        parent_comment_id,
        content
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        created_at,
        updated_at
    `,
    [postId, userId, parentCommentId, content],
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
        parent_comment_id,
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
