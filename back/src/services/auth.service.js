import pool from "../config/database.js";

import {
  findUserByEmail,
  findUserByNickname,
  createUser,
} from "../repositories/user.repository.js";

import { hashPassword, comparePassword } from "../utils/password.js";

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

import { hashToken } from "../utils/tokenHash.js";

import { USER_STATUS } from "../constants/roles.js";

import AppError from "../utils/appError.js";

const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000;

const getUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  nickname: user.nickname,
  role: user.role,
  status: user.status,
  createdAt: user.created_at,
});

// 회원가입
export const register = async ({ email, password, nickname }) => {
  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw new AppError("이미 사용 중인 이메일입니다.", 409);
  }

  const existingNickname = await findUserByNickname(nickname);

  if (existingNickname) {
    throw new AppError("이미 사용 중인 닉네임입니다.", 409);
  }

  const hashedPassword = await hashPassword(password);

  try {
    const user = await createUser({
      email,
      password: hashedPassword,
      nickname,
    });

    return { user };
  } catch (error) {
    if (error.code === "23505") {
      if (error.constraint === "users_email_key") {
        throw new AppError("이미 사용 중인 이메일입니다.", 409);
      }

      if (error.constraint === "users_nickname_key") {
        throw new AppError("이미 사용 중인 닉네임입니다.", 409);
      }
    }

    throw error;
  }
};

// Refresh Token DB 저장
const saveRefreshToken = async (userId, refreshToken) => {
  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION);

  await pool.query(
    `
        INSERT INTO refresh_tokens (
            user_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        `,
    [userId, tokenHash, expiresAt],
  );
};

// 로그인
export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError("정지된 계정입니다. 관리자에게 문의해주세요.", 403);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await saveRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: getUserResponse(user),
  };
};

// Refresh Token 갱신
export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh Token이 필요합니다.", 401);
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Refresh Token이 유효하지 않거나 만료되었습니다.", 401);
  }

  const oldTokenHash = hashToken(refreshToken);
  const client = await pool.connect();

  let result;

  try {
    await client.query("BEGIN");

    const tokenResult = await client.query(
      `
            SELECT
                id,
                user_id,
                expires_at,
                revoked_at
            FROM refresh_tokens
            WHERE token_hash = $1
            FOR UPDATE
            `,
      [oldTokenHash],
    );

    const oldToken = tokenResult.rows[0];

    if (!oldToken) {
      result = { status: "INVALID" };
    } else if (oldToken.revoked_at) {
      // 이미 폐기된 토큰의 재사용은 탈취 가능성으로 간주
      await client.query(
        `
                UPDATE refresh_tokens
                SET revoked_at = COALESCE(revoked_at, NOW())
                WHERE user_id = $1
                  AND revoked_at IS NULL
                `,
        [oldToken.user_id],
      );

      result = { status: "REPLAY" };
    } else if (new Date(oldToken.expires_at) <= new Date()) {
      await client.query(
        `
                UPDATE refresh_tokens
                SET revoked_at = NOW()
                WHERE id = $1
                  AND revoked_at IS NULL
                `,
        [oldToken.id],
      );

      result = { status: "EXPIRED" };
    } else {
      const userResult = await client.query(
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
                FOR SHARE
                `,
        [oldToken.user_id],
      );

      const user = userResult.rows[0];

      if (!user || user.status !== USER_STATUS.ACTIVE) {
        await client.query(
          `
                    UPDATE refresh_tokens
                    SET revoked_at = COALESCE(revoked_at, NOW())
                    WHERE user_id = $1
                      AND revoked_at IS NULL
                    `,
          [oldToken.user_id],
        );

        result = { status: "INACTIVE" };
      } else {
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        const newTokenHash = hashToken(newRefreshToken);

        const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION);

        const insertResult = await client.query(
          `
                    INSERT INTO refresh_tokens (
                        user_id,
                        token_hash,
                        expires_at
                    )
                    VALUES ($1, $2, $3)
                    RETURNING id
                    `,
          [user.id, newTokenHash, newExpiresAt],
        );

        const newTokenId = insertResult.rows[0].id;

        await client.query(
          `
                    UPDATE refresh_tokens
                    SET
                        revoked_at = NOW(),
                        replaced_by = $2
                    WHERE id = $1
                    `,
          [oldToken.id, newTokenId],
        );

        result = {
          status: "SUCCESS",
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: getUserResponse(user),
        };
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (result.status === "REPLAY") {
    throw new AppError("폐기된 Refresh Token이 재사용되었습니다. 다시 로그인해주세요.", 401);
  }

  if (result.status === "INACTIVE") {
    throw new AppError("계정이 정지되었거나 존재하지 않습니다.", 403);
  }

  if (result.status !== "SUCCESS") {
    throw new AppError("Refresh Token이 유효하지 않거나 만료되었습니다.", 401);
  }

  return result;
};

// 로그아웃
export const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);

  await pool.query(
    `
        UPDATE refresh_tokens
        SET revoked_at = COALESCE(revoked_at, NOW())
        WHERE token_hash = $1
        `,
    [tokenHash],
  );
};
