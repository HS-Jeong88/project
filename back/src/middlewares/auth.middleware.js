import { verifyAccessToken } from "../utils/jwt.js";
import { findUserById } from "../repositories/user.repository.js";
import { USER_STATUS } from "../constants/roles.js";
import AppError from "../utils/appError.js";

// Access Token 인증
export const authenticate = async (req, res, next) => {
  let payload;

  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AppError("인증 토큰이 필요합니다.", 401);
    }

    const token = authorization.slice(7);

    payload = verifyAccessToken(token);
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError("Access Token이 유효하지 않거나 만료되었습니다.", 401),
    );
  }

  try {
    const user = await findUserById(payload.sub);

    if (!user) {
      throw new AppError("존재하지 않는 사용자입니다.", 401);
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new AppError("정지된 계정입니다.", 403);
    }

    // JWT의 role이 아니라 DB의 최신 role을 사용한다.
    req.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// 지정한 권한만 접근 허용
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("로그인이 필요합니다.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("접근 권한이 없습니다.", 403));
    }

    next();
  };
};

// 리소스 작성자 또는 관리자만 접근 허용
// getOwnerId는 req를 받아 리소스 소유자 ID를 반환하는 함수다.
export const authorizeOwnerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("로그인이 필요합니다.", 401);
      }

      if (req.user.role === "ADMIN") {
        return next();
      }

      const ownerId = await getOwnerId(req);

      if (!ownerId) {
        throw new AppError("요청한 리소스를 찾을 수 없습니다.", 404);
      }

      if (String(ownerId) !== String(req.user.id)) {
        throw new AppError("본인이 작성한 리소스만 접근할 수 있습니다.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
