package main

import (
	"fmt"
	"log"
	"net/http"
	"starjaya-backend/internal/config"
	"starjaya-backend/internal/database"
	"starjaya-backend/internal/handlers"
	"starjaya-backend/internal/middleware"
	"starjaya-backend/internal/repository"
)

func main() {
	// 1. Load Config
	cfg := config.LoadConfig()

	// 2. Connect Database
	err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer database.DB.Close()

	// 3. Init Repository & Handlers
	repo := repository.NewPostgresRepo(database.DB)
	app := &handlers.App{Repo: repo}

	// 4. Setup Routes
	mux := http.NewServeMux()
	mux.HandleFunc("/", handlers.HomeParams)
	mux.HandleFunc("POST /login", app.Login)
	mux.HandleFunc("POST /transaksi", app.CreateTransaction)
	mux.HandleFunc("GET /barang", app.GetProducts)

	// 5. Start Server
	// Wrap with Middleware
	handler := middleware.Logger(middleware.EnableCORS(mux))

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting server on %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
