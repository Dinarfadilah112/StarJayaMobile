package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	SupabaseURL string
	SupabaseKey string
	DatabaseURL string
	Port        string
}

func LoadConfig() *Config {
	err := godotenv.Load(".env", "../.env")
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	return &Config{
		SupabaseURL: getEnv("EXPO_PUBLIC_SUPABASE_URL", ""),
		SupabaseKey: getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", ""),
		DatabaseURL: getEnv("DATABASE_URL", ""),
		Port:        getEnv("PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
