package db

import (
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"os"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
)

const defaultDatabaseURL = "postgres://postgres:postgres@127.0.0.1:5432/dcloud?sslmode=disable"

//go:embed sqlc/schema.sql
var schemaSQL string

func Open() (*sql.DB, error) {
	return OpenWithURL(env("DCLD_DATABASE_URL", defaultDatabaseURL))
}

func OpenWithURL(databaseURL string) (*sql.DB, error) {
	if databaseURL == "" {
		return nil, errors.New("database URL is required")
	}
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}
	if err := ensureSchema(db); err != nil {
		_ = db.Close()
		return nil, err
	}
	return db, nil
}

func Migrate(databaseURL string) error {
	if databaseURL == "" {
		return errors.New("database URL is required")
	}
	return initSchema(withReadWrite(databaseURL))
}

func withReadWrite(databaseURL string) string {
	if strings.Contains(databaseURL, "target_session_attrs") {
		return databaseURL
	}
	if strings.Contains(databaseURL, "?") {
		return databaseURL + "&target_session_attrs=read-write"
	}
	return databaseURL + "?target_session_attrs=read-write"
}

func initSchema(databaseURL string) error {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return err
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		return err
	}
	for _, stmt := range splitStatements(schemaSQL) {
		if _, err := db.Exec(stmt); err != nil {
			return fmt.Errorf("init schema: %w", err)
		}
	}
	return nil
}

func ensureSchema(db *sql.DB) error {
	var ready bool
	if err := db.QueryRow(`
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'identity_sessions'
      AND column_name  = 'expires_at'
)`).Scan(&ready); err != nil {
		return err
	}
	if !ready {
		return errors.New("database schema is not ready: identity_sessions.expires_at missing")
	}
	return nil
}

func splitStatements(sql string) []string {
	parts := strings.Split(sql, ";")
	stmts := make([]string, 0, len(parts))
	for _, part := range parts {
		stmt := strings.TrimSpace(part)
		if stmt != "" {
			stmts = append(stmts, stmt)
		}
	}
	return stmts
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
