/**
 * Date Formatting Utilities
 */

/**
 * Format ISO date string (YYYY-MM-DD) to DD-MM-YYYY format
 */
export const formatDateDDMMYYYY = (isoDate?: string): string => {
    if (!isoDate) return '-';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export const getTodayISO = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Format date for display in UI
 */
export const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
