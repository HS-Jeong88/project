import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET은 반드시 32자 이상의 안전한 문자열이어야 합니다.");
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  throw new Error("JWT_REFRESH_SECRET은 반드시 32자 이상의 안전한 문자열이어야 합니다.");
}

const JWT_OPTIONS = {
  issuer: "rag-board-api",
  audience: "rag-board-client",
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      type: "access",
    },
    JWT_SECRET,
    {
      ...JWT_OPTIONS,
      expiresIn: "15m",
    },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      type: "refresh",
      jti: randomUUID(),
    },
    JWT_REFRESH_SECRET,
    {
      ...JWT_OPTIONS,
      expiresIn: "7d",
    },
  );
};

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, JWT_SECRET, JWT_OPTIONS);

  if (payload.type !== "access") {
    throw new Error("올바르지 않은 Access Token입니다.");
  }

  return payload;
};

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET, JWT_OPTIONS);

  if (
    payload.type !== "refresh" ||
    typeof payload.sub !== "string" ||
    typeof payload.jti !== "string"
  ) {
    throw new Error("올바르지 않은 Refresh Token입니다.");
  }

  return payload;
};
