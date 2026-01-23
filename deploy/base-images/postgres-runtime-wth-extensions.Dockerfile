# ---------------------------------------------------------
# Version Definitions
# ---------------------------------------------------------
ARG PG_MAJOR=16
ARG PG_VERSION=16.4

# ---------------------------------------------------------
# Stage 1 — Build Extensions
# ---------------------------------------------------------
FROM postgres:${PG_MAJOR} AS builder
ARG PG_MAJOR
ARG PG_JIEBA_VERSION=v2.0.1
ARG PG_VECTOR_VERSION=v0.8.1
ARG PGMQ_VERSION=v1.8.0

ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    pkg-config \
    libicu-dev \
    postgresql-server-dev-${PG_MAJOR} \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Build pg_jieba
# ---------------------------------------------------------
RUN tmp=$(mktemp -d) && \
    git clone --branch "${PG_JIEBA_VERSION}" \
        https://github.com/jaiminpan/pg_jieba.git "$tmp/pg_jieba" && \
    cd "$tmp/pg_jieba" && \
    git submodule update --init --recursive || true && \
    ln -s "$tmp/pg_jieba/third_party/cppjieba" "$tmp/pg_jieba/cppjieba" && \
    cmake -S "$tmp/pg_jieba" \
          -B "$tmp/pg_jieba/build" \
          -DPostgreSQL_TYPE_INCLUDE_DIR=/usr/include/postgresql/${PG_MAJOR}/server && \
    cmake --build "$tmp/pg_jieba/build" --config Release -- -j"$(nproc)" && \
    cmake --install "$tmp/pg_jieba/build" && \
    rm -rf "$tmp"

# ---------------------------------------------------------
# Build pgmq
# ---------------------------------------------------------
RUN tmp=$(mktemp -d) && \
    git clone --depth 1 --branch "${PGMQ_VERSION}" \
        https://github.com/tembo-io/pgmq.git "$tmp/pgmq" && \
    cd "$tmp/pgmq/pgmq-extension" && \
    make && make install && \
    rm -rf "$tmp"

# ---------------------------------------------------------
# Build pgvector
# ---------------------------------------------------------
RUN tmp=$(mktemp -d) && \
    git clone --depth 1 --branch "${PG_VECTOR_VERSION}" \
        https://github.com/pgvector/pgvector.git "$tmp/pgvector" && \
    cd "$tmp/pgvector" && \
    make && make install && \
    rm -rf "$tmp"

# ---------------------------------------------------------
# Stage 2 — Runtime
# ---------------------------------------------------------
FROM postgres:${PG_MAJOR}

ARG PG_MAJOR
ARG PG_VERSION

LABEL maintainer="Cloud-Neutral Toolkit" \
      description="PostgreSQL ${PG_VERSION} + pgvector + pg_jieba + pgmq"

# Copy .so + extension files from builder
COPY --from=builder /usr/lib/postgresql/${PG_MAJOR}/lib/ /usr/lib/postgresql/${PG_MAJOR}/lib/
COPY --from=builder /usr/share/postgresql/${PG_MAJOR}/extension/ /usr/share/postgresql/${PG_MAJOR}/extension/

# No need to specify USER, EXPOSE, or CMD as they are inherited from the base image
# and correctly handled by the official entrypoint.
