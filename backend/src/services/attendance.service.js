import attendanceRepository from '../models/attendance.model.js';
import locationService from './location.service.js';
import {
    workSchedule,
    isWorkingDay,
    isWeekend,
    isRamadan,
    isLateCheckIn,
    isEarlyCheckOut,
    calculateWorkHours,
    calculateOvertime,
    getCheckOutConfig,
    getDayName
} from '../config/schedule.js';
import { getMalaysiaTime, getTodayDate, getCurrentTime, getCurrentTimestamp, getHoursAndMinutes, getDayOfWeek } from '../config/timezone.js';

class AttendanceService {
    // Check in
    async checkIn(userId, data = {}) {
        const today = getTodayDate();
        const currentTime = getCurrentTime(); // HH:MM:SS for display
        const currentTimestamp = getCurrentTimestamp(); // Full timestamp for TIMESTAMPTZ
        const { hours, minutes } = getHoursAndMinutes();
        const dayOfWeek = getDayOfWeek();

        // Check if weekend (off day) — allow but mark as OT
        const isWeekendDay = isWeekend(dayOfWeek);

        // Validate location (geofencing)
        let locationResult = null;
        if (data.latitude && data.longitude) {
            locationResult = await locationService.isWithinAllowedArea(
                parseFloat(data.latitude),
                parseFloat(data.longitude)
            );

            if (!locationResult.allowed && locationResult.reason !== 'no_locations_configured') {
                throw new Error(locationResult.message);
            }
        } else {
            // Check if any locations are configured
            const locations = await locationService.getAllLocations();
            if (locations.length > 0) {
                throw new Error('Sila aktifkan GPS untuk check-in. Lokasi diperlukan.');
            }
        }

        // Check if already checked in
        const existing = await attendanceRepository.findTodayByUser(userId);
        if (existing) {
            throw new Error('Anda sudah check-in hari ini');
        }

        let status = 'present';
        let isLate = false;

        if (isWeekendDay) {
            // Weekend: automatically OT, no late check
            status = 'ot';
        } else {
            // Working day: check if within check-in window
            const { earliest, latest } = workSchedule.checkIn;

            const currentMinutes = hours * 60 + minutes;
            const earliestMinutes = earliest.hours * 60 + earliest.minutes;
            const latestMinutes = latest.hours * 60 + latest.minutes;

            // Determine if late (9:01 AM onwards)
            isLate = currentMinutes > latestMinutes;

            // Require note if late
            if (isLate && !data.note) {
                throw new Error('Sila masukkan catatan kerana check-in lewat (selepas 9:00 pagi)');
            }

            if (isLate) {
                status = 'late';
            }
        }

        return attendanceRepository.create({
            user_id: userId,
            date: today,
            check_in: currentTimestamp,
            status,
            source: data.source || 'web',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            location_id: locationResult?.location?.id || null,
            device_info: data.device_info || null,
            note: data.note || null,
            is_late: isLate,
            is_weekend_ot: isWeekendDay
        });
    }

    // Check out
    async checkOut(userId, data = {}) {
        const currentTime = getCurrentTime(); // HH:MM:SS for calculations
        const currentTimestamp = getCurrentTimestamp(); // Full timestamp for TIMESTAMPTZ
        const dayOfWeek = getDayOfWeek();

        const existing = await attendanceRepository.findTodayByUser(userId);
        if (!existing) {
            throw new Error('Tiada rekod check-in untuk hari ini');
        }

        if (existing.check_out) {
            throw new Error('Anda sudah check-out hari ini');
        }

        const isWeekendDay = isWeekend(dayOfWeek);
        let isEarly = false;

        if (!isWeekendDay) {
            // Only check early leave on working days
            const isThursday = dayOfWeek === 4;
            const ramadanNow = isRamadan();
            const checkOutConfig = ramadanNow
                ? (isThursday ? workSchedule.ramadan.checkOut.thursday : workSchedule.ramadan.checkOut.regular)
                : (isThursday ? workSchedule.checkOut.thursday : workSchedule.checkOut.regular);

            const { hours, minutes } = getHoursAndMinutes();
            const currentMinutes = hours * 60 + minutes;
            const earliestMinutes = checkOutConfig.earliest.hours * 60 + checkOutConfig.earliest.minutes;
            isEarly = currentMinutes < earliestMinutes;

            // Require note if early leave
            if (isEarly && !data.note) {
                const earliestTime = `${checkOutConfig.earliest.hours}:${String(checkOutConfig.earliest.minutes).padStart(2, '0')}`;
                throw new Error(`Sila masukkan catatan kerana check-out awal (sebelum ${earliestTime})`);
            }
        }

        // Calculate work hours
        const workHours = calculateWorkHours(existing.check_in, currentTime);

        // Calculate overtime
        let overtimeHours;
        if (isWeekendDay) {
            // Weekend: ALL work hours count as overtime
            overtimeHours = workHours;
        } else {
            // Working day: only hours exceeding standard count as overtime
            const isThursday = dayOfWeek === 4;
            const ramadanNow = isRamadan();
            const standardHours = ramadanNow
                ? (isThursday ? workSchedule.ramadan.standardHours.thursday : workSchedule.ramadan.standardHours.regular)
                : (isThursday ? workSchedule.standardHours.thursday : workSchedule.standardHours.regular);
            overtimeHours = Math.max(0, workHours - standardHours);
        }

        // Update note - append if already exists
        let note = existing.note || '';
        if (data.note) {
            note = note ? `${note} | Keluar: ${data.note}` : data.note;
        }

        return attendanceRepository.update(existing.id, {
            check_out: currentTimestamp,
            work_hours: Math.round(workHours * 100) / 100,
            overtime_hours: Math.round(overtimeHours * 100) / 100,
            is_early_leave: isEarly,
            note
        });
    }

    // Get today's attendance
    async getToday(userId) {
        return attendanceRepository.findTodayByUser(userId);
    }

    // Get attendance history
    async getHistory(userId, options = {}) {
        return attendanceRepository.findHistoryByUser(userId, options);
    }

    // Get all attendance for a date (admin)
    async getAllByDate(date) {
        return attendanceRepository.findByDate(date);
    }

    // Get monthly summary with totals
    async getMonthlySummary(userId, year, month) {
        const records = await attendanceRepository.getMonthlySummary(userId, year, month);

        // Calculate summary stats
        const totalWorkHours = records.reduce((sum, r) => sum + (parseFloat(r.work_hours) || 0), 0);
        const totalOvertime = records.reduce((sum, r) => sum + (parseFloat(r.overtime_hours) || 0), 0);

        const summary = {
            total_days: records.length,
            present: records.filter(r => r.status === 'present').length,
            late: records.filter(r => r.status === 'late' || r.is_late).length,
            early_leave: records.filter(r => r.is_early_leave).length,
            ot_days: records.filter(r => r.status === 'ot').length,
            total_work_hours: Math.round(totalWorkHours * 100) / 100,
            total_overtime_hours: Math.round(totalOvertime * 100) / 100,
            records
        };

        return summary;
    }

    // Get work schedule info
    getScheduleInfo() {
        const ramadanNow = isRamadan();
        const checkOutConfig = ramadanNow
            ? workSchedule.ramadan.checkOut
            : workSchedule.checkOut;

        return {
            workingDays: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis'],
            offDays: ['Jumaat', 'Sabtu'],
            weekendOtAllowed: true,
            isRamadan: ramadanNow,
            checkIn: {
                earliest: '7:30 AM',
                latest: '9:00 AM'
            },
            checkOut: {
                regular: {
                    days: 'Ahad - Rabu',
                    earliest: this._formatHourMin(checkOutConfig.regular.earliest),
                    latest: this._formatHourMin(checkOutConfig.regular.latest)
                },
                thursday: {
                    days: 'Khamis',
                    earliest: this._formatHourMin(checkOutConfig.thursday.earliest),
                    latest: this._formatHourMin(checkOutConfig.thursday.latest)
                }
            }
        };
    }

    _formatHourMin({ hours, minutes }) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours > 12 ? hours - 12 : hours;
        const displayMin = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : ':00';
        return `${displayHour}${displayMin} ${period}`;
    }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
