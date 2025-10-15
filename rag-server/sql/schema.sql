-- ================================================
-- init.sql - Stable RAG schema with Hybrid Search
-- For pgvector ≥ 0.5, BGE-M3 (1024 dims), zhparser+english
-- ================================================

-- 1. 避免锁表/阻塞
SET lock_timeout = '5s';
SET statement_timeout = '0';

-- 2. 必要扩展（向量 + 中文分词）
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS zhparser;

-- 3. 中文+ 英文混合全文检索配置（zhparser + simple）
-- 自定义配置名：zhcn_search
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'zhcn_search') THEN
    CREATE TEXT SEARCH CONFIGURATION zhcn_search (PARSER = zhparser);
    ALTER TEXT SEARCH CONFIGURATION zhcn_search
      ADD MAPPING FOR n,v,a,i,e,l WITH simple;
  END IF;
END$$;

-- 4. 创建主表
CREATE TABLE IF NOT EXISTS public.documents (
    id          BIGSERIAL PRIMARY KEY,
    repo        TEXT        NOT NULL,
    path        TEXT        NOT NULL,
    chunk_id    INT         NOT NULL,
    content     TEXT        NOT NULL,
    embedding   VECTOR(1024),                    -- 向量字段（bge-m3）
    metadata    JSONB,
    content_sha TEXT        NOT NULL,

    -- 中文+英文全文搜索字段
    content_tsv tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('zhcn_search', coalesce(content, '')), 'A')
    ) STORED,

    -- 文档唯一标识（组合键 doc_key）
    doc_key     TEXT GENERATED ALWAYS AS (
      repo || ':' || path || ':' || chunk_id
    ) STORED,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. 唯一约束（支持 UPSERT）
CREATE UNIQUE INDEX IF NOT EXISTS documents_doc_key_uk
  ON public.documents (doc_key);

-- 6. 向量索引（仅索引非空 embedding）
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON public.documents
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

-- 7. 全文索引（中文 + 英文，使用 zhcn_search）
CREATE INDEX IF NOT EXISTS idx_documents_tsv
  ON public.documents USING gin (content_tsv);

-- 8. 复合过滤索引（适配 repo + path 检索场景）
CREATE INDEX IF NOT EXISTS idx_documents_repo_path
  ON public.documents (repo, path);
