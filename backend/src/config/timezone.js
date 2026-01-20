// Timezone configuration for Malaysia (GMT+8)
export const TIMEZONE = 'Asia/Kuala_Lumpur';
export const TIMEZONE_OFFSET_MS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

// Get current date and time in Malaysia timezone
export function getMalaysiaTime() {
    // Get current UTC time in milliseconds
    const nowUtc = Date.now();
    // Add 8 hours offset for Malaysia
    return new Date(nowUtc + TIMEZONE_OFFSET_MS);
}

// Get today's date string in YYYY-MM-DD format (Malaysia timezone)
export function getTodayDate() {
    const now = getMalaysiaTime();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get current time string in HH:MM:SS format (Malaysia timezone)
export function getCurrentTime() {
    const now = getMalaysiaTime();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Get day of week (0 = Sunday, 1 = Monday, etc.) in Malaysia timezone
export function getDayOfWeek() {
    return getMalaysiaTime().getUTCDay();
}

// Get hours and minutes for comparison
export function getHoursAndMinutes() {
    const now = getMalaysiaTime();
    return {
        hours: now.getUTCHours(),
        minutes: now.getUTCMinutes()
    };
}

// Debug function to see all time info
export function getDebugTimeInfo() {
    const serverNow = new Date();
    const malaysiaTime = getMalaysiaTime();
    return {
        serverTime: serverNow.toISOString(),
        serverTimestamp: Date.now(),
        malaysiaTime: malaysiaTime.toISOString(),
        malaysiaDate: getTodayDate(),
        malaysiaTimeStr: getCurrentTime(),
        malaysiaDayOfWeek: getDayOfWeek()
    };
}

export default {
    TIMEZONE,
    TIMEZONE_OFFSET_MS,
    getMalaysiaTime,
    getTodayDate,
    getCurrentTime,
    getDayOfWeek,
    getHoursAndMinutes,
    getDebugTimeInfo
};
