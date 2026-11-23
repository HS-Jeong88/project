
BEGIN;

-- =========================================
-- 1. AI 대화방 테이블
-- =========================================

CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chat_conversations_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT chat_conversations_title_not_empty
        CHECK (LENGTH(TRIM(title)) > 0)
);

-- 사용자의 최신 대화방을 빠르게 조회하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_updated
ON chat_conversations (user_id, updated_at DESC);


-- =========================================
-- 2. AI 대화 메시지 테이블
-- =========================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,

    role VARCHAR(20) NOT NULL,

    content TEXT NOT NULL,

    sources JSONB NOT NULL DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chat_messages_conversation_fk
        FOREIGN KEY (conversation_id)
        REFERENCES chat_conversations (id)
        ON DELETE CASCADE,

    CONSTRAINT chat_messages_role_check
        CHECK (role IN ('user', 'assistant')),

    CONSTRAINT chat_messages_content_not_empty
        CHECK (LENGTH(TRIM(content)) > 0),

    CONSTRAINT chat_messages_sources_array
        CHECK (JSONB_TYPEOF(sources) = 'array')
);

-- 대화방별 메시지 시간순 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
ON chat_messages (conversation_id, created_at ASC, id ASC);

COMMIT;
