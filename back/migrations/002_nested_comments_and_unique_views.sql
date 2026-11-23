
BEGIN;

-- =========================================
-- 1. 댓글 대댓글 기능
-- =========================================

-- 부모 댓글 ID 추가
-- 기존 댓글은 NULL이므로 일반 댓글로 유지됨
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID;

-- 자기 자신을 부모로 지정하는 것 방지
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'comments_parent_not_self'
    ) THEN
        ALTER TABLE comments
        ADD CONSTRAINT comments_parent_not_self
        CHECK (
            parent_comment_id IS NULL
            OR parent_comment_id <> id
        );
    END IF;
END $$;

-- 부모 댓글과 게시글의 관계가 일치하도록 복합 UNIQUE 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS comments_id_post_id_uidx
ON comments (id, post_id);

-- 부모 댓글은 반드시 같은 게시글에 속해야 함
-- 부모 댓글 삭제 시 대댓글도 함께 삭제
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'comments_parent_post_fk'
    ) THEN
        ALTER TABLE comments
        ADD CONSTRAINT comments_parent_post_fk
        FOREIGN KEY (parent_comment_id, post_id)
        REFERENCES comments (id, post_id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 부모 댓글 기준 조회 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx
ON comments (parent_comment_id);


-- =========================================
-- 2. 게시글 IP별 조회수 중복 방지
-- =========================================

CREATE TABLE IF NOT EXISTS post_views (
    post_id UUID NOT NULL,

    -- HMAC-SHA256 해시값 64자리
    -- 원본 IP 주소는 저장하지 않음
    ip_hash VARCHAR(64) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT post_views_pk
        PRIMARY KEY (post_id, ip_hash),

    CONSTRAINT post_views_post_fk
        FOREIGN KEY (post_id)
        REFERENCES posts (id)
        ON DELETE CASCADE,

    CONSTRAINT post_views_ip_hash_format
        CHECK (ip_hash ~ '^[a-f0-9]{64}$')
);

COMMIT;
