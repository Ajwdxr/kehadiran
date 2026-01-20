/**
 * Format timestamp or time string to display time only (HH:MM or HH:MM:SS)
 * @param {string} timeValue - ISO timestamp or HH:MM:SS string
 * @param {boolean} includeSeconds - Whether to include seconds in output
 * @returns {string} - Formatted time string
 */
export function formatTime(timeValue, includeSeconds = false) {
    if (!timeValue) return "-";

    try {
        // Check if it's an ISO timestamp (contains 'T')
        if (typeof timeValue === 'string' && timeValue.includes('T')) {
            const date = new Date(timeValue);
            return date.toLocaleTimeString('ms-MY', {
                hour: '2-digit',
                minute: '2-digit',
                second: includeSeconds ? '2-digit' : undefined,
                hour12: false
            });
        }

        // If it's already a time string (HH:MM:SS), format it
        const parts = timeValue.split(':');
        if (parts.length >= 2) {
            if (includeSeconds && parts.length >= 3) {
                return `${parts[0]}:${parts[1]}:${parts[2]}`;
            }
            return `${parts[0]}:${parts[1]}`;
        }

        return timeValue;
    } catch (e) {
        console.error("Format time error:", e);
        return timeValue;
    }
}

/**
 * Format Date to local date string (ms-MY)
 * @param {Date|string} dateValue 
 * @returns {string}
 */
export function formatDate(dateValue) {
    if (!dateValue) return "-";
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("ms-MY", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
