package models

import "time"

type Kategori struct {
	ID   int64  `json:"id_kategori" db:"id_kategori"`
	Nama string `json:"nama_kategori" db:"nama_kategori"`
}

type Barang struct {
	Kode       string `json:"kode_barang" db:"kode_barang"`
	Nama       string `json:"nama_barang" db:"nama_barang"`
	IDKategori int64  `json:"id_kategori" db:"id_kategori"`
	HargaJual  int64  `json:"harga_jual" db:"harga_jual"`
	Stok       int64  `json:"stok" db:"stok"`
	Barcode    string `json:"barcode" db:"barcode"`
	Merek      string `json:"merek" db:"merek"`
	TipeMotor  string `json:"tipe_motor" db:"tipe_motor"`
	HargaBeli  int64  `json:"harga_beli" db:"harga_beli"`
	Satuan     string `json:"satuan" db:"satuan"`
	LokasiRak  string `json:"lokasi_rak" db:"lokasi_rak"`
}

type User struct {
	ID     int64  `json:"id" db:"id"`
	Name   string `json:"name" db:"name"`
	Pin    string `json:"pin" db:"pin"`
	Role   string `json:"role" db:"role"`
	Avatar string `json:"avatar" db:"avatar"`
}

type Transaksi struct {
	ID            string    `json:"id_transaksi" db:"id_transaksi"`
	Tanggal       time.Time `json:"tanggal_transaksi" db:"tanggal_transaksi"`
	TotalHarga    int64     `json:"total_harga" db:"total_harga"`
	PaymentMethod string    `json:"payment_method" db:"payment_method"`
	ServiceFee    float64   `json:"service_fee" db:"service_fee"`
	StatusLunas   string    `json:"status_lunas" db:"status_lunas"`
}

type DetailTransaksi struct {
	ID          int64  `json:"id" db:"id"`
	IDTransaksi string `json:"id_transaksi" db:"id_transaksi"`
	KodeBarang  string `json:"kode_barang" db:"kode_barang"`
	NamaBarang  string `json:"nama_barang" db:"nama_barang"`
	Jumlah      int64  `json:"jumlah" db:"jumlah"`
	HargaSatuan int64  `json:"harga_satuan" db:"harga_satuan"`
	Subtotal    int64  `json:"subtotal" db:"subtotal"`
}
