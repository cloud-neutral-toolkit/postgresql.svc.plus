-- ================================================
-- init.sql - Stable RAG schema with Hybrid Search
-- For pgvector ≥ 0.5, BGE-M3 (1024 dims), pg_jieba + english
-- ================================================

SET lock_timeout = '5s';
SET statement_timeout = '0';

-- 1. 必要扩展：向量 + 中文分词
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_jieba;

-- 2. 中文 + 英文混合全文检索配置（pg_jieba + simple）
-- 自定义配置名：jieba_search
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'jieba_search') THEN
    CREATE TEXT SEARCH CONFIGURATION jieba_search (PARSER = pg_jieba);
    -- pg_jieba 的 token 类型包括：word, tag, symbol, number
    ALTER TEXT SEARCH CONFIGURATION jieba_search
      ADD MAPPING FOR word, tag, symbol, number WITH simple;
  END IF;
END$$;

-- 3. 主表结构
CREATE TABLE IF NOT EXISTS public.documents (
    id          BIGSERIAL PRIMARY KEY,
    repo        TEXT        NOT NULL,
    path        TEXT        NOT NULL,
    chunk_id    INT         NOT NULL,
    content     TEXT        NOT NULL,
    embedding   VECTOR(1024),
    metadata    JSONB,
    content_sha TEXT        NOT NULL,

    -- 全文检索字段（pg_jieba）
    content_tsv tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('jieba_search', coalesce(content, '')), 'A')
    ) STORED,

    doc_key     TEXT GENERATED ALWAYS AS (
      repo || ':' || path || ':' || chunk_id
    ) STORED,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 唯一约束
CREATE UNIQUE INDEX IF NOT EXISTS documents_doc_key_uk
  ON public.documents (doc_key);

-- 5. 向量索引
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON public.documents
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

-- 6. 全文索引（pg_jieba）
CREATE INDEX IF NOT EXISTS idx_documents_tsv
  ON public.documents USING gin (content_tsv);

-- 7. 复合索引
CREATE INDEX IF NOT EXISTS idx_documents_repo_path
  ON public.documents (repo, path);
