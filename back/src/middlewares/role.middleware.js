import { ROLES } from "../constants/roles.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "접근 권한이 없습니다.",
      });
    }

    next();
  };
};

export const adminOnly = authorize(ROLES.ADMIN);
export const userOnly = authorize(ROLES.USER, ROLES.ADMIN);
