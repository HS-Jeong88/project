import pg from "pg";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;

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

// 연결 오류 처리
pool.on("error", (error) => {
  console.error("PostgreSQL Pool Error:", error);
});

// DB 연결 테스트
export const connectDB = async () => {
  try {
    const client = await pool.connect();

    console.log("PostgreSQL Connected");

    client.release();
  } catch (error) {
    console.error("PostgreSQL Connection Failed:", error);
    throw error;
  }
};

// Pool 내보내기
export default pool;
