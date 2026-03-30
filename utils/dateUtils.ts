// Date utility functions for sales reports

export const getToday = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
        label: 'Hari Ini'
    };
};

export const getThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday

    const monday = new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0);
    const sunday = new Date(today.getFullYear(), today.getMonth(), diff + 6, 23, 59, 59);

    return {
        start: monday.toISOString(),
        end: sunday.toISOString(),
        label: 'Minggu Ini'
    };
};

export const getThisMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
        label: 'Bulan Ini'
    };
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const getMonthName = (date = new Date()): string => {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", 
        "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[date.getMonth()];
};
