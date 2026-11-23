import { createHmac } from "node:crypto";
import { isIP } from "node:net";

const normalizeIpAddress = (ipAddress) => {
  if (typeof ipAddress !== "string" || !ipAddress.trim()) {
    throw new Error("유효한 IP 주소가 전달되지 않았습니다.");
  }

  let normalizedIp = ipAddress.trim();

  // IPv6 Zone ID 제거
  normalizedIp = normalizedIp.split("%")[0];

  // IPv4-mapped IPv6 주소 정규화
  if (normalizedIp.toLowerCase().startsWith("::ffff:")) {
    normalizedIp = normalizedIp.substring(7);
  }

  normalizedIp = normalizedIp.toLowerCase();

  if (!isIP(normalizedIp)) {
    throw new Error("유효하지 않은 IP 주소입니다.");
  }

  return normalizedIp;
};

export const createIpHash = (ipAddress) => {
  const secret = process.env.VIEW_IP_HMAC_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("VIEW_IP_HMAC_SECRET 환경변수가 없거나 길이가 부족합니다.");
  }

  const normalizedIp = normalizeIpAddress(ipAddress);

  return createHmac("sha256", secret).update(normalizedIp).digest("hex");
};
