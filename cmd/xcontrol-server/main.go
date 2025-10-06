package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"
	"github.com/spf13/cobra"

	rconfig "xcontrol/internal/rag/config"
	"xcontrol/server"
	"xcontrol/server/api"
	"xcontrol/server/config"
	"xcontrol/server/proxy"
)

var (
	configPath string
	logLevel   string
)

var rootCmd = &cobra.Command{
	Use:   "xcontrol-server",
	Short: "Start the xcontrol server",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := config.Load(configPath)
		if err != nil {
			slog.Warn("load config", "err", err)
			cfg = &config.Config{}
		}
		if logLevel != "" {
			cfg.Log.Level = logLevel
		}
		if configPath != "" {
			api.ConfigPath = configPath
			rconfig.ServerConfigPath = configPath
		}
		proxy.Set(cfg.Global.Proxy)

		level := slog.LevelInfo
		switch strings.ToLower(cfg.Log.Level) {
		case "debug":
			level = slog.LevelDebug
		case "warn", "warning":
			level = slog.LevelWarn
		case "error":
			level = slog.LevelError
		}
		logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
		slog.SetDefault(logger)

		var conn *pgx.Conn
		if dsn := cfg.Global.VectorDB.DSN(); dsn != "" {
			logger.Debug("connecting to postgres", "dsn", dsn)
			conn, err = pgx.Connect(context.Background(), dsn)
			if err != nil {
				logger.Error("postgres connect error", "err", err)
			} else {
				logger.Info("postgres connected")
			}
		} else {
			logger.Warn("postgres dsn not provided")
		}

		if addr := cfg.Global.Redis.Addr; addr != "" {
			logger.Debug("connecting to redis", "addr", addr)
			rdb := redis.NewClient(&redis.Options{
				Addr:     addr,
				Password: cfg.Global.Redis.Password,
			})
			if err := rdb.Ping(context.Background()).Err(); err != nil {
				logger.Error("redis connect error", "err", err)
			} else {
				logger.Info("redis connected")
			}
		} else {
			logger.Warn("redis addr not provided")
		}

		r := server.New(
			api.RegisterRoutes(conn, cfg.Sync.Repo.Proxy),
		)
		server.UseCORS(r, logger, cfg.Server)

		addr := cfg.Server.Addr
		if addr == "" {
			addr = ":8080"
		}

		srv := &http.Server{
			Addr:         addr,
			Handler:      r,
			ReadTimeout:  cfg.Server.ReadTimeout.Duration,
			WriteTimeout: cfg.Server.WriteTimeout.Duration,
		}

		logger.Info("starting http server", "addr", addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("http server shutdown", "err", err)
		}
	},
}

func init() {
	rootCmd.Flags().StringVar(&configPath, "config", "", "path to server configuration file")
	rootCmd.Flags().StringVar(&logLevel, "log-level", "", "log level (debug, info, warn, error)")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
