# Build XControl API with RAG module
FROM golang:1.21 AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /xcontrol ./rag-server/cmd/xcontrol-server

FROM gcr.io/distroless/base-debian12
WORKDIR /
COPY --from=builder /xcontrol /xcontrol
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/xcontrol"]
