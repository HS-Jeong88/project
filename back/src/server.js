import app from "./app.js";
import pool, { connectDB } from "./config/database.js";

const PORT = Number(process.env.PORT || 3000);

let server;
let isShuttingDown = false;

const startServer = async () => {
  try {
    // DB 연결 확인
    await connectDB();

    // 서버 실행
    server = app.listen(PORT, () => {
      console.log("=================================");
      console.log(" RAG Board Server Started");
      console.log(` Port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(` Process ID: ${process.pid}`);
      console.log("=================================");
    });

    server.on("error", (error) => {
      console.error("[SERVER] Error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("[SERVER] Startup failed:", error);

    await pool.end();

    process.exit(1);
  }
};

const shutdown = async () => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`[SERVER] Shutdown initiated.`);

  if (!server) {
    await pool.end();
    process.exit(0);
    return;
  }

  server.close(async (error) => {
    if (error) {
      console.error("[SERVER] Close error:", error);
    }

    try {
      await pool.end();
      console.log("[DB] Connection pool closed");
    } catch (dbError) {
      console.error("[DB] Shutdown error:", dbError);
    }

    process.exit(error ? 1 : 0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
