import attendanceRepository from '../models/attendance.model.js';
import locationService from './location.service.js';
import {
    workSchedule,
    isWorkingDay,
    isLateCheckIn,
    isEarlyCheckOut,
    calculateWorkHours,
    calculateOvertime,
    getCheckOutConfig,
    getDayName
} from '../config/schedule.js';
import { getMalaysiaTime, getTodayDate, getCurrentTime } from '../config/timezone.js';

class AttendanceService {
    // Check in
    async checkIn(userId, data = {}) {
        const now = getMalaysiaTime();
        const today = getTodayDate();
        const currentTime = getCurrentTime();

        // Check if working day
        if (!isWorkingDay(now)) {
            const dayName = getDayName(now.getUTCDay());
            throw new Error(`Hari ini (${dayName}) bukan hari bekerja`);
        }

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

        // Check if within check-in window
        const hours = now.getUTCHours();
        const minutes = now.getUTCMinutes();
        const { earliest, latest } = workSchedule.checkIn;

        const currentMinutes = hours * 60 + minutes;
        const earliestMinutes = earliest.hours * 60 + earliest.minutes;
        const latestMinutes = latest.hours * 60 + latest.minutes;

        // Allow check-in but mark as late if after latest time
        const isLate = currentMinutes > latestMinutes;

        // Require note if late
        if (isLate && !data.note) {
            throw new Error('Sila masukkan catatan kerana check-in lewat');
        }

        // Determine status
        let status = 'present';
        if (isLate) {
            status = 'late';
        }

        return attendanceRepository.create({
            user_id: userId,
            date: today,
            check_in: currentTime,
            status,
            source: data.source || 'web',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            location_id: locationResult?.location?.id || null,
            device_info: data.device_info || null,
            note: data.note || null,
            is_late: isLate
        });
    }

    // Check out
    async checkOut(userId, data = {}) {
        const now = getMalaysiaTime();
        const currentTime = getCurrentTime();

        const existing = await attendanceRepository.findTodayByUser(userId);
        if (!existing) {
            throw new Error('Tiada rekod check-in untuk hari ini');
        }

        if (existing.check_out) {
            throw new Error('Anda sudah check-out hari ini');
        }

        // Check if early leave
        const isEarly = isEarlyCheckOut(currentTime, now);

        // Require note if early leave
        if (isEarly && !data.note) {
            const config = getCheckOutConfig(now);
            const earliestTime = `${config.earliest.hours}:${String(config.earliest.minutes).padStart(2, '0')}`;
            throw new Error(`Sila masukkan catatan kerana check-out awal (sebelum ${earliestTime})`);
        }

        // Calculate work hours
        const workHours = calculateWorkHours(existing.check_in, currentTime);
        const overtimeHours = calculateOvertime(workHours, now);

        // Update note - append if already exists
        let note = existing.note || '';
        if (data.note) {
            note = note ? `${note} | Keluar: ${data.note}` : data.note;
        }

        return attendanceRepository.update(existing.id, {
            check_out: currentTime,
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
            total_work_hours: Math.round(totalWorkHours * 100) / 100,
            total_overtime_hours: Math.round(totalOvertime * 100) / 100,
            records
        };

        return summary;
    }

    // Get work schedule info
    getScheduleInfo() {
        return {
            workingDays: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis'],
            offDays: ['Jumaat', 'Sabtu'],
            checkIn: {
                earliest: '7:30 AM',
                latest: '9:00 AM'
            },
            checkOut: {
                regular: {
                    days: 'Ahad - Rabu',
                    earliest: '4:30 PM',
                    latest: '6:00 PM'
                },
                thursday: {
                    days: 'Khamis',
                    earliest: '3:00 PM',
                    latest: '4:30 PM'
                }
            }
        };
    }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
