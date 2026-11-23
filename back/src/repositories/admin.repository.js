import pool from "../config/database.js";

// 사용자 목록
export const findUsers = async ({ search, role, status, limit, offset }) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    const index = values.length;

    conditions.push(`
            (
                email ILIKE $${index}
                OR nickname ILIKE $${index}
            )
        `);
  }

  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const result = await pool.query(
    `
        SELECT
            id,
            email,
            nickname,
            role,
            status,
            created_at,
            updated_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC, id DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
        `,
    values,
  );

  return result.rows;
};

// 사용자 수
export const countUsers = async ({ search, role, status }) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    const index = values.length;

    conditions.push(`
            (
                email ILIKE $${index}
                OR nickname ILIKE $${index}
            )
        `);
  }

  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
        SELECT COUNT(*)::int AS total
        FROM users
        ${whereClause}
        `,
    values,
  );

  return result.rows[0].total;
};

// 사용자 상세
export const findUserDetail = async (userId) => {
  const result = await pool.query(
    `
        SELECT
            u.id,
            u.email,
            u.nickname,
            u.role,
            u.status,
            u.created_at,
            u.updated_at,
            (
                SELECT COUNT(*)::int
                FROM posts p
                WHERE p.user_id = u.id
            ) AS post_count,
            (
                SELECT COUNT(*)::int
                FROM comments c
                WHERE c.user_id = u.id
            ) AS comment_count
        FROM users u
        WHERE u.id = $1
        LIMIT 1
        `,
    [userId],
  );

  return result.rows[0] || null;
};

// 사용자 기본 정보
export const findUserForManagement = async (userId) => {
  const result = await pool.query(
    `
        SELECT
            id,
            email,
            nickname,
            role,
            status
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
    [userId],
  );

  return result.rows[0] || null;
};

// 마지막 활성 관리자 보호를 위한 권한 변경
export const changeUserRole = async ({ userId, role }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 관리자 권한 변경 작업을 직렬화한다.
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [81234, 1]);

    const targetResult = await client.query(
      `
            SELECT id, email, nickname, role, status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
      [userId],
    );

    const target = targetResult.rows[0];

    if (!target) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }

    const removesActiveAdmin =
      target.role === "ADMIN" && target.status === "ACTIVE" && role !== "ADMIN";

    if (removesActiveAdmin) {
      const countResult = await client.query(
        `
                SELECT COUNT(*)::int AS total
                FROM users
                WHERE role = 'ADMIN'
                  AND status = 'ACTIVE'
                `,
      );

      if (countResult.rows[0].total <= 1) {
        await client.query("ROLLBACK");
        return { lastAdmin: true };
      }
    }

    const updateResult = await client.query(
      `
            UPDATE users
            SET
                role = $2,
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                id,
                email,
                nickname,
                role,
                status,
                created_at,
                updated_at
            `,
      [userId, role],
    );

    await client.query("COMMIT");

    return {
      user: updateResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// 마지막 활성 관리자 보호를 위한 계정 상태 변경
export const changeUserStatus = async ({ userId, status }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [81234, 1]);

    const targetResult = await client.query(
      `
            SELECT id, email, nickname, role, status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
      [userId],
    );

    const target = targetResult.rows[0];

    if (!target) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }

    const removesActiveAdmin =
      target.role === "ADMIN" && target.status === "ACTIVE" && status === "SUSPENDED";

    if (removesActiveAdmin) {
      const countResult = await client.query(
        `
                SELECT COUNT(*)::int AS total
                FROM users
                WHERE role = 'ADMIN'
                  AND status = 'ACTIVE'
                `,
      );

      if (countResult.rows[0].total <= 1) {
        await client.query("ROLLBACK");
        return { lastAdmin: true };
      }
    }

    const updateResult = await client.query(
      `
            UPDATE users
            SET
                status = $2,
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                id,
                email,
                nickname,
                role,
                status,
                created_at,
                updated_at
            `,
      [userId, status],
    );

    // 정지된 사용자의 Refresh Token도 모두 폐기한다.
    if (status === "SUSPENDED") {
      await client.query(
        `
                UPDATE refresh_tokens
                SET revoked_at = COALESCE(revoked_at, NOW())
                WHERE user_id = $1
                  AND revoked_at IS NULL
                `,
        [userId],
      );
    }

    await client.query("COMMIT");

    return {
      user: updateResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// 게시글 목록
export const findAllPosts = async ({ search, limit, offset }) => {
  const values = [];
  let whereClause = "";

  if (search) {
    values.push(`%${search}%`);

    whereClause = `
            WHERE (
                p.title ILIKE $1
                OR p.content ILIKE $1
                OR u.nickname ILIKE $1
                OR u.email ILIKE $1
            )
        `;
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const result = await pool.query(
    `
        SELECT
            p.id,
            p.user_id,
            p.title,
            p.content,
            p.view_count,
            p.created_at,
            p.updated_at,
            u.nickname AS author_nickname,
            u.email AS author_email
        FROM posts p
        INNER JOIN users u
            ON p.user_id = u.id
        ${whereClause}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
        `,
    values,
  );

  return result.rows;
};

// 전체 게시글 수
export const countAllPosts = async (search) => {
  const values = [];
  let whereClause = "";

  if (search) {
    values.push(`%${search}%`);

    whereClause = `
            WHERE (
                p.title ILIKE $1
                OR p.content ILIKE $1
                OR u.nickname ILIKE $1
                OR u.email ILIKE $1
            )
        `;
  }

  const result = await pool.query(
    `
        SELECT COUNT(*)::int AS total
        FROM posts p
        INNER JOIN users u
            ON p.user_id = u.id
        ${whereClause}
        `,
    values,
  );

  return result.rows[0].total;
};

// 게시글 삭제
export const deletePostById = async (postId) => {
  const result = await pool.query(
    `
        DELETE FROM posts
        WHERE id = $1
        RETURNING id
        `,
    [postId],
  );

  return result.rows[0] || null;
};

// 댓글 목록
export const findAllComments = async ({ search, limit, offset }) => {
  const values = [];
  let whereClause = "";

  if (search) {
    values.push(`%${search}%`);

    whereClause = `
            WHERE (
                c.content ILIKE $1
                OR u.nickname ILIKE $1
                OR u.email ILIKE $1
                OR p.title ILIKE $1
            )
        `;
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const result = await pool.query(
    `
        SELECT
            c.id,
            c.post_id,
            c.user_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.nickname AS author_nickname,
            u.email AS author_email,
            p.title AS post_title
        FROM comments c
        INNER JOIN users u
            ON c.user_id = u.id
        INNER JOIN posts p
            ON c.post_id = p.id
        ${whereClause}
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
        `,
    values,
  );

  return result.rows;
};

// 전체 댓글 수
export const countAllComments = async (search) => {
  const values = [];
  let whereClause = "";

  if (search) {
    values.push(`%${search}%`);

    whereClause = `
            WHERE (
                c.content ILIKE $1
                OR u.nickname ILIKE $1
                OR u.email ILIKE $1
                OR p.title ILIKE $1
            )
        `;
  }

  const result = await pool.query(
    `
        SELECT COUNT(*)::int AS total
        FROM comments c
        INNER JOIN users u
            ON c.user_id = u.id
        INNER JOIN posts p
            ON c.post_id = p.id
        ${whereClause}
        `,
    values,
  );

  return result.rows[0].total;
};

// 댓글 삭제
export const deleteCommentById = async (commentId) => {
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
