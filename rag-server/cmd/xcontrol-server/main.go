package main

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"
	"github.com/spf13/cobra"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"xcontrol/rag-server"
	"xcontrol/rag-server/api"
	"xcontrol/rag-server/config"
	rconfig "xcontrol/rag-server/internal/rag/config"
	"xcontrol/rag-server/proxy"
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

		api.ConfigureServiceDB(nil)
		dsn := cfg.Global.VectorDB.DSN()
		var (
			conn  *pgx.Conn
			sqlDB *sql.DB
		)
		if dsn != "" {
			logger.Debug("connecting to postgres", "dsn", dsn)
			conn, err = pgx.Connect(context.Background(), dsn)
			if err != nil {
				logger.Error("postgres connect error", "err", err)
			} else {
				logger.Info("postgres connected")
			}

			gormDB, gormErr := gorm.Open(postgres.Open(dsn), &gorm.Config{})
			if gormErr != nil {
				logger.Error("gorm postgres connect error", "err", gormErr)
			} else {
				api.ConfigureServiceDB(gormDB)
				sqlDB, err = gormDB.DB()
				if err != nil {
					logger.Error("postgres db handle error", "err", err)
				}
			}
		} else {
			logger.Warn("postgres dsn not provided")
		}

		if sqlDB != nil {
			defer func() {
				if cerr := sqlDB.Close(); cerr != nil {
					logger.Error("close postgres db", "err", cerr)
				}
			}()
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
