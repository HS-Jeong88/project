import app from "./app.js";
import pool, { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // DB 연결 확인
    await connectDB();

    // 서버 실행
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // 서버 종료 처리
    const shutdown = async () => {
      console.log("Server shutting down...");

      server.close(async () => {
        await pool.end();
        console.log("PostgreSQL Pool Closed");

        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Server Startup Failed:", error);

    await pool.end();

    process.exit(1);
  }
};

startServer();
