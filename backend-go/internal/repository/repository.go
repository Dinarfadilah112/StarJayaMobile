package repository

import (
	"context"
	"database/sql"
	"errors"
	"starjaya-backend/internal/models"
	"time"
)

type Repository interface {
	// User
	GetUserByPin(ctx context.Context, pin string) (*models.User, error)
	
	// Products (Barang)
	GetAllBarang(ctx context.Context) ([]models.Barang, error)
	GetBarangByCode(ctx context.Context, code string) (*models.Barang, error)
	UpdateStock(ctx context.Context, code string, quantity int64) error
	
	// Transaction
	CreateTransaksi(ctx context.Context, trx models.Transaksi, details []models.DetailTransaksi) error
}

type PostgresRepo struct {
	DB *sql.DB
}

func NewPostgresRepo(db *sql.DB) Repository {
	return &PostgresRepo{DB: db}
}

func (r *PostgresRepo) GetUserByPin(ctx context.Context, pin string) (*models.User, error) {
	query := `SELECT id, name, pin, role, avatar FROM public.users WHERE pin = $1`
	row := r.DB.QueryRowContext(ctx, query, pin)
	
	var user models.User
	err := row.Scan(&user.ID, &user.Name, &user.Pin, &user.Role, &user.Avatar)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (r *PostgresRepo) GetAllBarang(ctx context.Context) ([]models.Barang, error) {
	query := `SELECT kode_barang, nama_barang, id_kategori, harga_jual, stok, barcode, merek, tipe_motor, harga_beli, satuan, lokasi_rak FROM public.barang`
	rows, err := r.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.Barang
	for rows.Next() {
		var i models.Barang
		// Handle potential NULLs if necessary, but models use non-pointers for simplicity here.
		// Assuming schema NOT NULL for critical fields or DB cleanup. 
		// For strings in Go, NULL scans to empty string if using sql.NullString, but we used string. 
		// We'll assume the schema enforces values or we'd need sql.NullString.
		if err := rows.Scan(
			&i.Kode, &i.Nama, &i.IDKategori, &i.HargaJual, &i.Stok, 
			&i.Barcode, &i.Merek, &i.TipeMotor, &i.HargaBeli, &i.Satuan, &i.LokasiRak,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *PostgresRepo) GetBarangByCode(ctx context.Context, code string) (*models.Barang, error) {
	query := `SELECT kode_barang, nama_barang, id_kategori, harga_jual, stok FROM public.barang WHERE kode_barang = $1`
	row := r.DB.QueryRowContext(ctx, query, code)
	
	var i models.Barang
	// We only scan a few fields for quick lookup
	err := row.Scan(&i.Kode, &i.Nama, &i.IDKategori, &i.HargaJual, &i.Stok)
	if err != nil {
		return nil, err
	}
	return &i, nil
}

func (r *PostgresRepo) UpdateStock(ctx context.Context, code string, delta int64) error {
	// delta can be negative (decrease) or positive (increase)
	query := `UPDATE public.barang SET stok = stok + $1 WHERE kode_barang = $2`
	_, err := r.DB.ExecContext(ctx, query, delta, code)
	return err
}

func (r *PostgresRepo) CreateTransaksi(ctx context.Context, trx models.Transaksi, details []models.DetailTransaksi) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert Header
	queryTrx := `
		INSERT INTO public.transaksi (id_transaksi, total_harga, payment_method, service_fee, status_lunas, tanggal_transaksi) 
		VALUES ($1, $2, $3, $4, $5, $6)`
	
	_, err = tx.ExecContext(ctx, queryTrx, trx.ID, trx.TotalHarga, trx.PaymentMethod, trx.ServiceFee, trx.StatusLunas, time.Now())
	if err != nil {
		return err
	}

	// 2. Insert Details & Update Stock
	queryDetail := `
		INSERT INTO public.detail_transaksi (id_transaksi, kode_barang, nama_barang, jumlah, harga_satuan, subtotal)
		VALUES ($1, $2, $3, $4, $5, $6)`
	
	queryStock := `UPDATE public.barang SET stok = stok - $1 WHERE kode_barang = $2`

	for _, d := range details {
		// Insert detail
		_, err = tx.ExecContext(ctx, queryDetail, trx.ID, d.KodeBarang, d.NamaBarang, d.Jumlah, d.HargaSatuan, d.Subtotal)
		if err != nil {
			return err
		}

		// Update stock (Subtract quantity)
		_, err = tx.ExecContext(ctx, queryStock, d.Jumlah, d.KodeBarang)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
