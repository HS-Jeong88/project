import { register, login, refresh, logout } from "../services/auth.service.js";

const COOKIE_NAME = "refreshToken";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "strict",
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const setRefreshCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

const clearRefreshCookie = (res) => {
  const options = getCookieOptions();

  delete options.maxAge;

  res.clearCookie(COOKIE_NAME, options);
};

// 회원가입
export const registerController = async (req, res, next) => {
  try {
    const result = await register(req.validatedBody);

    return res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 로그인
export const loginController = async (req, res, next) => {
  try {
    const result = await login(req.validatedBody);

    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: "로그인에 성공했습니다.",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Access Token 갱신
export const refreshController = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies?.[COOKIE_NAME];

    const result = await refresh(oldRefreshToken);

    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: "토큰이 갱신되었습니다.",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 로그아웃
export const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[COOKIE_NAME];

    await logout(refreshToken);

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "로그아웃되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

// 현재 로그인 사용자 확인
export const meController = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "인증된 사용자입니다.",
    data: {
      user: req.user,
    },
  });
};
