package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib" // PGX Driver
)

var DB *sql.DB

func Connect(databaseUrl string) error {
	log.Println("Initializing DB Connection to Supabase...")
	if databaseUrl == "" {
		return fmt.Errorf("DATABASE_URL environment variable is not set")
	}
	return ConnectWithDSN(databaseUrl)
}

func ConnectWithDSN(dsn string) error {
	var err error
	DB, err = sql.Open("pgx", dsn)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err = DB.PingContext(ctx); err != nil {
		return fmt.Errorf("unable to ping database: %w", err)
	}

	log.Println("Connected to Database via PGX!")
	return nil
}
