package handlers

import (
	"encoding/json"
	"net/http"
	"starjaya-backend/internal/models"
	"starjaya-backend/internal/repository"
)

type App struct {
	Repo repository.Repository
}

func (app *App) Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Pin string `json:"pin"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid input")
		return
	}

	user, err := app.Repo.GetUserByPin(r.Context(), input.Pin)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "Invalid PIN")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Login successful",
		"user":    user,
		// In real world, generate JWT here
	})
}

func (app *App) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Transaction models.Transaksi         `json:"transaction"`
		Details     []models.DetailTransaksi `json:"details"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	// Basic Validation
	if payload.Transaction.ID == "" || len(payload.Details) == 0 {
		RespondError(w, http.StatusBadRequest, "Transaction ID and details are required")
		return
	}

	err := app.Repo.CreateTransaksi(r.Context(), payload.Transaction, payload.Details)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to process transaction: "+err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{
		"message": "Transaction created successfully",
	})
}

func (app *App) GetProducts(w http.ResponseWriter, r *http.Request) {
	products, err := app.Repo.GetAllBarang(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to fetch products")
		return
	}
	RespondJSON(w, http.StatusOK, products)
}
