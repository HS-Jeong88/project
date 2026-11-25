import path from "path";
import { fileURLToPath } from "url";
import swaggerAutogen from "swagger-autogen";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = {
  info: {
    title: "Project API Docs",
    description: "Express 자동 생성 API 문서",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1", // /api/v1 프리픽스를 여기에 포함
      description: "Local Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = path.resolve(__dirname, "../src/swagger-output.json");
// ✅ app.js 대신 routes/index.js를 직접 진입점으로 지정
const endpointsFiles = [
  path.resolve(__dirname, "../src/routes/index.js"),
  path.resolve(__dirname, "../src/routes/auth.routes.js"),
  path.resolve(__dirname, "../src/routes/admin.routes.js"),
  path.resolve(__dirname, "../src/routes/post.routes.js"),
  path.resolve(__dirname, "../src/routes/comment.routes.js"),
  path.resolve(__dirname, "../src/routes/rag.routes.js"),
];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
