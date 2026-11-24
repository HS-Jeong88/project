import "dotenv/config";

import { gemini, geminiConfig } from "../src/config/gemini.js";

// 재시도 대기
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 일시적인 서버 오류 재시도
const retryRequest = async (name, request, maxRetries = 3) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n[${name}] 요청 (${attempt + 1}/${maxRetries + 1})`);

      return await request();
    } catch (error) {
      const message = error.message || "";
      const isTemporaryError =
        message.includes("503") ||
        message.includes("UNAVAILABLE") ||
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("500") ||
        message.includes("502") ||
        message.includes("504");

      if (!isTemporaryError || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(1000 * 2 ** attempt, 8000);

      console.log(`[${name}] 일시적 오류 발생. ${delay / 1000}초 후 재시도합니다.`);

      await sleep(delay);
    }
  }
};

const testEmbedding = async () => {
  console.log("\n================================");
  console.log("1. Gemini 임베딩 테스트");
  console.log("================================");

  const response = await retryRequest("임베딩", () =>
    gemini.models.embedContent({
      model: geminiConfig.embeddingModel,
      contents: "RAG는 검색 증강 생성 기술입니다.",
      config: {
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: geminiConfig.embeddingDimension,
      },
    }),
  );

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("임베딩 결과가 반환되지 않았습니다.");
  }

  if (embedding.length !== geminiConfig.embeddingDimension) {
    throw new Error(`벡터 차원 불일치: ${embedding.length}`);
  }

  console.log("임베딩 생성 성공");
  console.log("모델:", geminiConfig.embeddingModel);
  console.log("벡터 차원:", embedding.length);

  return true;
};

const testGeneration = async () => {
  console.log("\n================================");
  console.log("2. Gemini 답변 생성 테스트");
  console.log("================================");

  const response = await retryRequest("답변 생성", () =>
    gemini.models.generateContent({
      model: geminiConfig.chatModel,
      contents: "안녕하세요. RAG 챗봇 연결 테스트입니다. 짧게 답변해 주세요.",
    }),
  );

  const answer = response.text;

  if (!answer) {
    throw new Error("Gemini 답변이 반환되지 않았습니다.");
  }

  console.log("답변 생성 성공");
  console.log("모델:", geminiConfig.chatModel);
  console.log("답변:", answer);

  return true;
};

const main = async () => {
  try {
    console.log("Gemini API 연결 테스트 시작");

    await testEmbedding();
    await testGeneration();

    console.log("\n================================");
    console.log("Gemini API 테스트 전체 성공");
    console.log("================================");
  } catch (error) {
    console.error("\nGemini API 테스트 실패");
    console.error("오류:", error.message);

    process.exitCode = 1;
  }
};

await main();
