const defaultSettings = {
    name: 'SMART WORKSHOP',
    address: 'Sistem Manajemen Bengkel & Sparepart',
    phone: '',
    footer: 'TERIMA KASIH\nSilakan Datang Kembali'
};

export const generateReceiptHtml = (
    transactionId: string,
    date: Date,
    cart: any[],
    subtotal: number,
    serviceFee: number,
    paymentMethod: string,
    settings?: {
        store_name?: string;
        store_address?: string;
        store_phone?: string;
        receipt_footer?: string;
        logo_uri?: string;
        receipt_font_size?: number;
        receipt_color?: string;
        paper_size?: '58mm' | '80mm';
    } | null
): string => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = subtotal + serviceFee;

    const name = settings?.store_name || defaultSettings.name;
    const address = settings?.store_address || defaultSettings.address;
    const phone = settings?.store_phone || defaultSettings.phone;
    const footer = settings?.receipt_footer || defaultSettings.footer;
    const fontSize = settings?.receipt_font_size || 11;
    const accentColor = settings?.receipt_color || '#000000';
    const paperWidth = settings?.paper_size === '80mm' ? '440px' : '300px';

    return `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
                    body {
                        font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                        padding: 10px;
                        max-width: ${paperWidth}; /* Adaptive thermal width */
                        margin: 0 auto;
                        background-color: #fff;
                        color: ${accentColor};
                        font-size: ${fontSize}px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 5px;
                    }
                    .brand-name {
                        font-size: ${fontSize * 2}px;
                        font-weight: 900;
                        text-transform: uppercase;
                        border-bottom: 4px solid ${accentColor};
                        display: block;
                        padding-bottom: 2px;
                        margin-bottom: 8px;
                    }
                    .address {
                         font-size: 10px;
                         line-height: 1.2;
                         margin-bottom: 2px;
                         text-align: center;
                         font-weight: 500;
                    }
                    .phone {
                         font-size: 10px;
                         text-align: center;
                         margin-bottom: 10px;
                    }
                    .divider-dashed {
                        border-top: 1.5px dotted ${accentColor};
                        margin: 8px 0;
                    }
                    .divider-dotted {
                        border-top: 1px dotted #ccc;
                        margin: 8px 0;
                    }
                    .small-text {
                        font-size: 11px;
                        margin-bottom: 4px;
                    }
                    .item-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        margin-bottom: 6px;
                    }
                    .item-name {
                        font-weight: 900;
                        flex: 2;
                        text-transform: uppercase;
                    }
                    .item-qty {
                        flex: 1;
                        text-align: center;
                    }
                    .item-price {
                        flex: 1;
                        text-align: right;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        margin-bottom: 4px;
                    }
                    .total-label {
                        font-weight: 900;
                        font-size: 13px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                    }
                    .footer-bold {
                        font-size: 12px;
                        font-weight: 900;
                        text-transform: uppercase;
                        margin-bottom: 2px;
                    }
                    .note {
                        margin-top: 15px;
                        font-size: 9px;
                        line-height: 1.3;
                        text-align: center;
                        font-weight: 500;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    ${settings?.logo_uri ? `<img src="${settings.logo_uri}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 8px;" />` : ''}
                    <div class="brand-name">${name}</div>
                    <div class="address">${address}</div>
                    <div class="phone">${phone}</div>
                </div>

                <div class="divider-dashed"></div>
                <div class="small-text">No: ${transactionId}</div>
                <div class="divider-dashed"></div>

                <div class="items-list">
                    ${cart.map((item: any) => `
                        <div class="item-row">
                            <span class="item-name">${item.quantity} ${item.name}</span>
                            <span class="item-qty">${item.quantity}</span>
                            <span class="item-price">${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="divider-dotted"></div>

                <div class="summary">
                    <div class="summary-row">
                        <span>Total Item</span>
                        <span>${totalItems}</span>
                    </div>
                    <div class="summary-row">
                        <span>Total Belanja</span>
                        <span style="font-weight: 900;">${subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    ${serviceFee > 0 ? `
                    <div class="summary-row">
                        <span>Jasa / Service</span>
                        <span>${serviceFee.toLocaleString('id-ID')}</span>
                    </div>
                    ` : ''}
                    
                    <div class="divider-dashed"></div>
                    
                    <div class="summary-row">
                        <span class="total-label">TOTAL TAGIHAN</span>
                        <span class="total-label">${grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <div class="summary-row" style="margin-top: 4px;">
                        <span>Tunai</span>
                        <span>${grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="summary-row">
                        <span>Kembalian</span>
                        <span>0</span>
                    </div>
                </div>

                <div class="divider-dashed"></div>
                <div style="text-align: center; font-size: 10px; margin: 5px 0;">
                    Tgl. Cetak: ${date.toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-')}
                </div>
                <div class="divider-dashed"></div>

                <div class="footer">
                    <div class="footer-bold">${footer.split('\n')[0]}</div>
                    <div class="footer-bold">${footer.split('\n')[1] || ''}</div>
                    
                    <div class="note">
                        <b>NOTE :</b> JIKA ADA KOMPLAIN/KERUSAKAN SPAREPART (ITEM) SERTAKAN STRUK PEMBELIAN, JIKA TIDAK ADA BUKTI STRUK PEMBELIAN KAMI ANGGAP HANGUS
                    </div>
                </div>
            </body>
        </html>
    `;
};
