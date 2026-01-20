// Work schedule configuration
// Working days: Sunday (0) to Thursday (4)
// Friday (5) and Saturday (6) are off days

export const workSchedule = {
    // Working days (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    workingDays: [0, 1, 2, 3, 4], // Ahad - Khamis
    offDays: [5, 6], // Jumaat - Sabtu

    // Check-in window
    checkIn: {
        earliest: { hours: 7, minutes: 30 },  // 7:30 AM
        latest: { hours: 9, minutes: 0 },      // 9:00 AM (after this = late)
        standard: { hours: 8, minutes: 0 }     // 8:00 AM standard start
    },

    // Check-out times by day
    checkOut: {
        // Sunday (0) to Wednesday (3): 4:30 PM - 6:00 PM
        regular: {
            earliest: { hours: 16, minutes: 30 }, // 4:30 PM (before this = early leave)
            latest: { hours: 18, minutes: 0 },    // 6:00 PM
            standard: { hours: 16, minutes: 30 }  // 4:30 PM standard end
        },
        // Thursday (4): 3:00 PM - 4:30 PM
        thursday: {
            earliest: { hours: 15, minutes: 0 },  // 3:00 PM (before this = early leave)
            latest: { hours: 16, minutes: 30 },   // 4:30 PM
            standard: { hours: 15, minutes: 0 }   // 3:00 PM standard end
        }
    },

    // Standard work hours per day
    standardHours: {
        regular: 8.5,   // Ahad - Rabu (8:00 AM - 4:30 PM)
        thursday: 7     // Khamis (8:00 AM - 3:00 PM)
    }
};

// Helper functions
export function isWorkingDay(date) {
    const day = date.getUTCDay();
    return workSchedule.workingDays.includes(day);
}

export function getDayName(day) {
    const names = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    return names[day];
}

export function isThursday(date) {
    return date.getUTCDay() === 4;
}

export function getCheckOutConfig(date) {
    return isThursday(date)
        ? workSchedule.checkOut.thursday
        : workSchedule.checkOut.regular;
}

export function getStandardHours(date) {
    return isThursday(date)
        ? workSchedule.standardHours.thursday
        : workSchedule.standardHours.regular;
}

// Time comparison helpers
export function timeToMinutes(hours, minutes) {
    return hours * 60 + minutes;
}

export function parseTimeString(timeStr) {
    if (!timeStr) return null;

    let hours, minutes;

    // Check if it's an ISO timestamp or TIMESTAMPTZ
    if (typeof timeStr === 'string' && timeStr.includes('T')) {
        try {
            // Create a Date object from the ISO string
            const date = new Date(timeStr);

            // We need to extract the hours and minutes in Malaysia context (UTC+8)
            // This is the most reliable way regardless of server timezone
            const utcMs = date.getTime();
            const malaysiaMs = utcMs + (8 * 60 * 60 * 1000);
            const myDate = new Date(malaysiaMs);

            // Use getUTC methods on the adjusted date to get Malaysia's actual HH:MM
            hours = myDate.getUTCHours();
            minutes = myDate.getUTCMinutes();
        } catch (e) {
            console.error('Error parsing ISO time:', e);
            return null;
        }
    } else {
        // Handle HH:MM:SS format (assumed to be already in Malaysia time)
        const parts = timeStr.split(':');
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1]);
    }

    if (isNaN(hours) || isNaN(minutes)) return null;

    return { hours, minutes, totalMinutes: hours * 60 + minutes };
}

export function isLateCheckIn(checkInTime) {
    const time = parseTimeString(checkInTime);
    if (!time) return false;

    const latestAllowed = timeToMinutes(
        workSchedule.checkIn.latest.hours,
        workSchedule.checkIn.latest.minutes
    );

    return time.totalMinutes > latestAllowed;
}

export function isEarlyCheckOut(checkOutTime, date) {
    const time = parseTimeString(checkOutTime);
    if (!time) return false;

    const config = getCheckOutConfig(date);
    const earliestAllowed = timeToMinutes(config.earliest.hours, config.earliest.minutes);

    return time.totalMinutes < earliestAllowed;
}

export function calculateWorkHours(checkInTime, checkOutTime, date = new Date()) {
    const checkIn = parseTimeString(checkInTime);
    const checkOut = parseTimeString(checkOutTime);

    if (!checkIn || !checkOut) return 0;

    // Normalize check-in: if before 7:30 AM, treat as 7:30 AM
    const earliestMinutes = 7 * 60 + 30; // 7:30 AM
    const effectiveCheckInMinutes = Math.max(checkIn.totalMinutes, earliestMinutes);

    const minutesWorked = checkOut.totalMinutes - effectiveCheckInMinutes;
    return Math.max(0, minutesWorked / 60);
}

export function calculateOvertime(workHours, date) {
    const standardHours = getStandardHours(date);
    const overtime = workHours - standardHours;
    return Math.max(0, overtime);
}

export default workSchedule;
