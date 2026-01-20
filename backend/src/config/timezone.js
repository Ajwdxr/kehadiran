// Timezone configuration for Malaysia (GMT+8)
// Simple and reliable implementation

export const TIMEZONE = 'Asia/Kuala_Lumpur';
export const TIMEZONE_OFFSET_HOURS = 8;

/**
 * Get current Malaysia time as a formatted object
 * This approach avoids Date object timezone issues by calculating directly
 */
export function getMalaysiaTimeInfo() {
    // Get current UTC timestamp
    const now = new Date();
    const utcMs = now.getTime();
    const utcOffsetMs = now.getTimezoneOffset() * 60 * 1000;

    // Calculate Malaysia time (UTC+8)
    const malaysiaMs = utcMs + utcOffsetMs + (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
    const malaysiaDate = new Date(malaysiaMs);

    return {
        year: malaysiaDate.getFullYear(),
        month: malaysiaDate.getMonth() + 1,
        day: malaysiaDate.getDate(),
        hours: malaysiaDate.getHours(),
        minutes: malaysiaDate.getMinutes(),
        seconds: malaysiaDate.getSeconds(),
        dayOfWeek: malaysiaDate.getDay(),
        date: malaysiaDate
    };
}

/**
 * Get Malaysia time as Date object (for compatibility)
 */
export function getMalaysiaTime() {
    return getMalaysiaTimeInfo().date;
}

/**
 * Get today's date in YYYY-MM-DD format (Malaysia timezone)
 */
export function getTodayDate() {
    const t = getMalaysiaTimeInfo();
    const year = t.year;
    const month = String(t.month).padStart(2, '0');
    const day = String(t.day).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get current time in HH:MM:SS format (Malaysia timezone)
 */
export function getCurrentTime() {
    const t = getMalaysiaTimeInfo();
    const hours = String(t.hours).padStart(2, '0');
    const minutes = String(t.minutes).padStart(2, '0');
    const seconds = String(t.seconds).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get current timestamp in ISO format with Malaysia timezone offset
 * Format: 2026-01-20T12:32:21+08:00
 * This is suitable for TIMESTAMPTZ columns
 */
export function getCurrentTimestamp() {
    const t = getMalaysiaTimeInfo();
    const year = t.year;
    const month = String(t.month).padStart(2, '0');
    const day = String(t.day).padStart(2, '0');
    const hours = String(t.hours).padStart(2, '0');
    const minutes = String(t.minutes).padStart(2, '0');
    const seconds = String(t.seconds).padStart(2, '0');

    // ISO format with Malaysia timezone offset (+08:00)
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday) in Malaysia timezone
 */
export function getDayOfWeek() {
    return getMalaysiaTimeInfo().dayOfWeek;
}

/**
 * Get hours and minutes for schedule comparison
 */
export function getHoursAndMinutes() {
    const t = getMalaysiaTimeInfo();
    return {
        hours: t.hours,
        minutes: t.minutes
    };
}

/**
 * Debug function to see all time info
 */
export function getDebugTimeInfo() {
    const serverNow = new Date();
    const t = getMalaysiaTimeInfo();
    return {
        serverTimeUTC: serverNow.toISOString(),
        serverTimestamp: Date.now(),
        serverTimezoneOffset: serverNow.getTimezoneOffset(),
        malaysiaDate: getTodayDate(),
        malaysiaTime: getCurrentTime(),
        malaysiaDayOfWeek: t.dayOfWeek,
        malaysiaHours: t.hours,
        malaysiaMinutes: t.minutes
    };
}

export default {
    TIMEZONE,
    TIMEZONE_OFFSET_HOURS,
    getMalaysiaTime,
    getMalaysiaTimeInfo,
    getTodayDate,
    getCurrentTime,
    getCurrentTimestamp,
    getDayOfWeek,
    getHoursAndMinutes,
    getDebugTimeInfo
};
