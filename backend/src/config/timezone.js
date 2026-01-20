// Timezone configuration for Malaysia (GMT+8)
export const TIMEZONE = 'Asia/Kuala_Lumpur';
export const TIMEZONE_OFFSET_HOURS = 8; // UTC+8

// Get current date and time in Malaysia timezone
export function getMalaysiaTime() {
    const now = new Date();
    // Add 8 hours to UTC time to get Malaysia time
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utcTime + (TIMEZONE_OFFSET_HOURS * 3600000));
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
    TIMEZONE_OFFSET_HOURS,
    getMalaysiaTime,
    getTodayDate,
    getCurrentTime,
    getDayOfWeek,
    getHoursAndMinutes
};
