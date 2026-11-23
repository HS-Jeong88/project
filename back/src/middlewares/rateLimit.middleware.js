import pool from "../config/database.js";

const rateLimit = ({
  windowMs = 60 * 1000,
  maxRequests = 30,
  keyPrefix = "api",
  message = "요청 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
} = {}) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";

      // 같은 IP라도 제한 종류별로 별도 관리
      const currentWindow = Math.floor(Date.now() / windowMs);

      const rateKey = [keyPrefix, ip, currentWindow].join(":");

      const expiresAt = new Date((currentWindow + 1) * windowMs);

      const result = await pool.query(
        `
                INSERT INTO api_rate_limits (
                    rate_key,
                    request_count,
                    expires_at
                )
                VALUES ($1, 1, $2)

                ON CONFLICT (rate_key)
                DO UPDATE SET
                    request_count = api_rate_limits.request_count + 1,
                    expires_at = EXCLUDED.expires_at

                RETURNING request_count
                `,
        [rateKey, expiresAt],
      );

      const requestCount = result.rows[0].request_count;

      res.setHeader("RateLimit-Limit", String(maxRequests));
      res.setHeader("RateLimit-Remaining", String(Math.max(0, maxRequests - requestCount)));

      if (requestCount > maxRequests) {
        res.setHeader(
          "Retry-After",
          String(Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000))),
        );

        return res.status(429).json({
          success: false,
          code: "RATE_LIMIT_EXCEEDED",
          message,
        });
      }

      // 만료된 제한 기록 정리
      // 매 요청마다 DELETE하지 않도록 일정 확률로 실행
      if (Math.random() < 0.01) {
        pool
          .query(
            `
                    DELETE FROM api_rate_limits
                    WHERE expires_at < NOW()
                    `,
          )
          .catch((error) => {
            console.error("[RATE LIMIT CLEANUP ERROR]", error.message);
          });
      }

      next();
    } catch (error) {
      console.error("[RATE LIMIT ERROR]", error.message);

      // DB에서 제한 횟수를 확인할 수 없으면 인증 API를 허용하지 않음
      return res.status(503).json({
        success: false,
        code: "RATE_LIMIT_SERVICE_UNAVAILABLE",
        message: "요청 제한 서비스를 일시적으로 사용할 수 없습니다.",
      });
    }
  };
};

export default rateLimit;
