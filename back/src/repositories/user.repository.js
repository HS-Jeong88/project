import pool from "../config/database.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
        SELECT
            id,
            email,
            password,
            nickname,
            role,
            status,
            created_at
        FROM users
        WHERE email = $1
        LIMIT 1
        `,
    [email],
  );

  return result.rows[0] || null;
};

export const findUserByNickname = async (nickname) => {
  const result = await pool.query(
    `
        SELECT id
        FROM users
        WHERE nickname = $1
        LIMIT 1
        `,
    [nickname],
  );

  return result.rows[0] || null;
};

// ID로 사용자 조회: 인증 및 권한 확인용
export const findUserById = async (id) => {
  const result = await pool.query(
    `
        SELECT
            id,
            email,
            nickname,
            role,
            status,
            created_at
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
    [id],
  );

  return result.rows[0] || null;
};

export const createUser = async ({ email, password, nickname }) => {
  const result = await pool.query(
    `
        INSERT INTO users (
            email,
            password,
            nickname,
            role,
            status
        )
        VALUES ($1, $2, $3, 'USER', 'ACTIVE')
        RETURNING
            id,
            email,
            nickname,
            role,
            status,
            created_at
        `,
    [email, password, nickname],
  );

  return result.rows[0];
};
