import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import * as Print from 'expo-print';

// Secure access to directory and encoding for cross-platform/version compatibility
const getExportUri = (filename: string): string | null => {
    const fs = FileSystem as any;
    const dir = fs.cacheDirectory || fs.documentDirectory;
    if (!dir) return null;
    const baseDir = dir.endsWith('/') ? dir : `${dir}/`;
    return `${baseDir}${filename}`;
};

const getEncoding = (type: string) => {
    const fs = FileSystem as any;
    return fs.EncodingType?.[type] || type.toLowerCase();
};

// Export to CSV
export const exportToCSV = async (data: any[], filename: string, headers: string[]) => {
    try {
        // Convert data to CSV string
        let csvContent = headers.join(',') + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape quotes and wrap in quotes if contains comma
                return typeof value === 'string' && value.includes(',')
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            });
            csvContent += values.join(',') + '\n';
        });

        // Resolve Path
        const fileUri = getExportUri(filename);
        if (!fileUri) throw new Error('Export directory is not available');

        // Save to file
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: getEncoding('UTF8')
        });

        // Share file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            console.log('Sharing not available');
        }

        return fileUri;
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw error;
    }
};

// Export to Excel
export const exportToExcel = async (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    try {
        // Create workbook
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Generate binary string
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        // Resolve Path
        const fileUri = getExportUri(filename);
        if (!fileUri) throw new Error('Export directory is not available');

        // Save to file
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
            encoding: getEncoding('Base64')
        });

        // Share file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            console.log('Sharing not available');
        }

        return fileUri;
    } catch (error) {
        console.error('Error exporting Excel:', error);
        throw error;
    }
};

// Export to PDF (Native Expo Print)
export const exportToPDF = async (htmlContent: string, filename: string) => {
    try {
        // 1. Generate PDF from HTML
        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false
        });

        // 2. Share the generated PDF
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Simpan Laporan PDF',
                UTI: 'com.adobe.pdf'
            });
        }

        return uri;
    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw error;
    }
};

// Generate HTML report for PDF export
export const generateReportHTML = (
    title: string,
    period: string,
    data: any[],
    columns: { key: string; label: string }[],
    shopName: string = 'mOTO',
    shopSubtitle: string = 'Sistem Manajemen Bengkel & Sparepart'
): string => {
    // Calculate totals for financial data
    const totalRevenue = data.reduce((sum, row) => sum + (parseFloat(row['Total'] || row['Revenue'] || 0) || 0), 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @page { margin: 20px; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1e293b; background-color: #fff; }
        .header-container { display: flex; justify-content: space-between; border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { color: #0284c7; }
        .brand h1 { margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; }
        .brand p { margin: 4px 0 0 0; font-size: 14px; opacity: 0.8; }
        .report-info { text-align: right; }
        .report-info h2 { margin: 0; font-size: 20px; color: #334155; }
        .report-info p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        th { background-color: #0284c7; color: white; padding: 14px 10px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
        tr:nth-child(even) { background-color: #f8fafc; }
        
        .summary-box { margin-top: 40px; background-color: #f1f5f9; padding: 20px; border-radius: 12px; display: flex; justify-content: flex-end; }
        .summary-item { text-align: right; }
        .summary-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
        .summary-value { font-size: 24px; color: #0284c7; font-weight: 800; }
        
        .footer { position: fixed; bottom: 40px; left: 40px; right: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header-container">
        <div class="brand">
            <h1>${shopName}</h1>
            <p>${shopSubtitle}</p>
        </div>
        <div class="report-info">
            <h2>${title}</h2>
            <p>Periode: ${period}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${columns.map(col => `<td>${row[col.key] !== undefined ? row[col.key] : '-'}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>

    ${totalRevenue > 0 ? `
    <div class="summary-box">
        <div class="summary-item">
            <div class="summary-label">Total Akumulasi</div>
            <div class="summary-value">Rp ${totalRevenue.toLocaleString('id-ID')}</div>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <div>Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
        <div>Halaman 1 / 1</div>
        <div>mOTO - Mobile Otomotif</div>
    </div>
</body>
</html>
    `;
};
