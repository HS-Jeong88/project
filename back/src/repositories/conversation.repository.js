import pool from "../config/database.js";

// =========================================
// 1. 대화방 생성
// =========================================

export const createConversation = async ({ userId, title }, client = pool) => {
  const result = await client.query(
    `
      INSERT INTO chat_conversations (
        user_id,
        title
      )
      VALUES ($1, $2)
      RETURNING
        id,
        user_id,
        title,
        created_at,
        updated_at
    `,
    [userId, title],
  );

  return result.rows[0];
};

// =========================================
// 2. 사용자별 대화방 목록 조회
// =========================================

export const findConversationsByUserId = async (
  { userId, limit = 50, offset = 0 },
  client = pool,
) => {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("대화방 조회 개수가 올바르지 않습니다.");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("대화방 조회 시작 위치가 올바르지 않습니다.");
  }

  const result = await client.query(
    `
      SELECT
        c.id,
        c.user_id,
        c.title,
        c.created_at,
        c.updated_at,
        (
          SELECT COUNT(*)::INTEGER
          FROM chat_messages cm
          WHERE cm.conversation_id = c.id
        ) AS message_count
      FROM chat_conversations c
      WHERE c.user_id = $1
      ORDER BY c.updated_at DESC, c.id DESC
      LIMIT $2
      OFFSET $3
    `,
    [userId, limit, offset],
  );

  return result.rows;
};

// =========================================
// 3. 대화방 ID로 조회
// =========================================

export const findConversationById = async (conversationId, client = pool) => {
  const result = await client.query(
    `
      SELECT
        id,
        user_id,
        title,
        created_at,
        updated_at
      FROM chat_conversations
      WHERE id = $1
      LIMIT 1
    `,
    [conversationId],
  );

  return result.rows[0] || null;
};

// =========================================
// 4. 대화방 ID + 사용자 ID로 소유권 확인
// =========================================

export const findConversationByIdAndUserId = async ({ conversationId, userId }, client = pool) => {
  const result = await client.query(
    `
      SELECT
        id,
        user_id,
        title,
        created_at,
        updated_at
      FROM chat_conversations
      WHERE
        id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [conversationId, userId],
  );

  return result.rows[0] || null;
};

// =========================================
// 5. 메시지 생성
// =========================================

export const createMessage = async (
  { conversationId, role, content, sources = [] },
  client = pool,
) => {
  if (!["user", "assistant"].includes(role)) {
    throw new Error("메시지 역할이 올바르지 않습니다.");
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("메시지 내용이 비어 있습니다.");
  }

  if (!Array.isArray(sources)) {
    throw new Error("메시지 참고 자료 형식이 올바르지 않습니다.");
  }

  const result = await client.query(
    `
      INSERT INTO chat_messages (
        conversation_id,
        role,
        content,
        sources
      )
      VALUES ($1, $2, $3, $4::jsonb)
      RETURNING
        id,
        conversation_id,
        role,
        content,
        sources,
        created_at
    `,
    [conversationId, role, content, JSON.stringify(sources)],
  );

  return result.rows[0];
};

// =========================================
// 6. 대화방 메시지 목록 조회
// =========================================

export const findMessagesByConversationId = async (conversationId, client = pool) => {
  const result = await client.query(
    `
      SELECT
        id,
        conversation_id,
        role,
        content,
        sources,
        created_at
      FROM chat_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC, id ASC
    `,
    [conversationId],
  );

  return result.rows;
};

// =========================================
// 7. 대화방 제목 및 수정 시간 갱신
// =========================================

export const updateConversation = async ({ conversationId, title }, client = pool) => {
  const result = await client.query(
    `
      UPDATE chat_conversations
      SET
        title = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        user_id,
        title,
        created_at,
        updated_at
    `,
    [conversationId, title],
  );

  return result.rows[0] || null;
};

// =========================================
// 8. 대화방 수정 시간만 갱신
// =========================================

export const touchConversation = async (conversationId, client = pool) => {
  const result = await client.query(
    `
      UPDATE chat_conversations
      SET updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        updated_at
    `,
    [conversationId],
  );

  return result.rows[0] || null;
};

// =========================================
// 9. 대화방 삭제
// =========================================

export const deleteConversation = async ({ conversationId, userId }, client = pool) => {
  const result = await client.query(
    `
      DELETE FROM chat_conversations
      WHERE
        id = $1
        AND user_id = $2
      RETURNING id
    `,
    [conversationId, userId],
  );

  return result.rowCount > 0;
};
