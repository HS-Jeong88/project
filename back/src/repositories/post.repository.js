import pool from "../config/database.js";

const SORT_COLUMNS = {
  created_at: "p.created_at",
  view_count: "p.view_count",
  title: "p.title",
};

const buildSearchCondition = ({ keyword, searchType }) => {
  if (!keyword) {
    return {
      condition: "",
      values: [],
    };
  }

  const searchValue = `%${keyword}%`;

  if (searchType === "title") {
    return {
      condition: "AND p.title ILIKE $1",
      values: [searchValue],
    };
  }

  if (searchType === "content") {
    return {
      condition: "AND p.content ILIKE $1",
      values: [searchValue],
    };
  }

  return {
    condition: `
            AND (
                p.title ILIKE $1
                OR p.content ILIKE $1
            )
        `,
    values: [searchValue],
  };
};

// 게시글 목록
export const findPosts = async ({ page, limit, keyword, searchType, sortBy, order }) => {
  const offset = (page - 1) * limit;

  const { condition, values } = buildSearchCondition({
    keyword,
    searchType,
  });

  const sortColumn = SORT_COLUMNS[sortBy];
  const sortOrder = order.toUpperCase();

  const listValues = [...values, limit, offset];

  const listResult = await pool.query(
    `
        SELECT
            p.id,
            p.title,
            p.content,
            p.view_count,
            p.created_at,
            p.updated_at,
            p.user_id,
            u.nickname AS author_nickname
        FROM posts p
        JOIN users u
            ON p.user_id = u.id
        WHERE 1 = 1
        ${condition}
        ORDER BY ${sortColumn} ${sortOrder}, p.id DESC
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
        `,
    listValues,
  );

  const countResult = await pool.query(
    `
        SELECT COUNT(*)::INTEGER AS total
        FROM posts p
        WHERE 1 = 1
        ${condition}
        `,
    values,
  );

  return {
    posts: listResult.rows,
    total: countResult.rows[0].total,
  };
};

// 게시글 상세 조회 + 조회수 증가
export const findPostById = async (postId) => {
  const result = await pool.query(
    `
        UPDATE posts
        SET view_count = view_count + 1
        WHERE id = $1
        RETURNING
            id,
            user_id,
            title,
            content,
            view_count,
            created_at,
            updated_at
        `,
    [postId],
  );

  if (!result.rows[0]) {
    return null;
  }

  const post = result.rows[0];

  const userResult = await pool.query(
    `
        SELECT nickname
        FROM users
        WHERE id = $1
        `,
    [post.user_id],
  );

  return {
    ...post,
    author_nickname: userResult.rows[0]?.nickname || null,
  };
};

// 게시글 생성
export const createPost = async ({ userId, title, content }) => {
  const result = await pool.query(
    `
        INSERT INTO posts (
            user_id,
            title,
            content
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            user_id,
            title,
            content,
            view_count,
            created_at,
            updated_at
        `,
    [userId, title, content],
  );

  return result.rows[0];
};

// 게시글 수정
export const updatePost = async ({ postId, userId, role, title, content }) => {
  const values = [];
  const setClauses = [];

  if (title !== undefined) {
    values.push(title);
    setClauses.push(`title = $${values.length}`);
  }

  if (content !== undefined) {
    values.push(content);
    setClauses.push(`content = $${values.length}`);
  }

  setClauses.push("updated_at = NOW()");

  values.push(postId);
  const postIdIndex = values.length;

  values.push(userId);
  const userIdIndex = values.length;

  values.push(role);
  const roleIndex = values.length;

  const result = await pool.query(
    `
        UPDATE posts
        SET ${setClauses.join(", ")}
        WHERE id = $${postIdIndex}
          AND (
              user_id = $${userIdIndex}
              OR $${roleIndex} = 'ADMIN'
          )
        RETURNING
            id,
            user_id,
            title,
            content,
            view_count,
            created_at,
            updated_at
        `,
    values,
  );

  return result.rows[0] || null;
};

// 게시글 존재 여부 확인
export const findPostOwner = async (postId) => {
  const result = await pool.query(
    `
        SELECT user_id
        FROM posts
        WHERE id = $1
        `,
    [postId],
  );

  return result.rows[0] || null;
};

// 게시글 삭제
export const deletePost = async ({ postId, userId, role }) => {
  const result = await pool.query(
    `
        DELETE FROM posts
        WHERE id = $1
          AND (
              user_id = $2
              OR $3 = 'ADMIN'
          )
        RETURNING id
        `,
    [postId, userId, role],
  );

  return result.rows[0] || null;
};
