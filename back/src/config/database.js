import pg from "pg";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;

const requiredEnv = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_PORT",
  "DB_MAX_CONNECTIONS",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`필수 환경변수가 설정되지 않았습니다: ${key}`);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: Number(process.env.DB_MAX_CONNECTIONS || 10),

  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
  console.log("[DB] PostgreSQL connection established");
});

pool.on("error", (error) => {
  console.error("[DB] Unexpected pool error:", error);
});

export const connectDB = async () => {
  try {
    await pool.query("SELECT 1");

    console.log(`[DB] Connected successfully: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error("[DB] Connection failed:", error);
    throw error;
  }
};

// Pool 내보내기
export default pool;
