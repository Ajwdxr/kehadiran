// Timezone configuration for Malaysia (GMT+8)
export const TIMEZONE = 'Asia/Kuala_Lumpur';

// Get current date and time in Malaysia timezone
export function getMalaysiaTime() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
}

// Get today's date string in YYYY-MM-DD format (Malaysia timezone)
export function getTodayDate() {
    const now = getMalaysiaTime();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get current time string in HH:MM:SS format (Malaysia timezone)
export function getCurrentTime() {
    const now = getMalaysiaTime();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Get day of week (0 = Sunday, 1 = Monday, etc.) in Malaysia timezone
export function getDayOfWeek() {
    return getMalaysiaTime().getDay();
}

// Get hours and minutes for comparison
export function getHoursAndMinutes() {
    const now = getMalaysiaTime();
    return {
        hours: now.getHours(),
        minutes: now.getMinutes()
    };
}

export default {
    TIMEZONE,
    getMalaysiaTime,
    getTodayDate,
    getCurrentTime,
    getDayOfWeek,
    getHoursAndMinutes
};
