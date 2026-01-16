import { writable, derived } from 'svelte/store';
import api from '$lib/api/client.js';

function createAttendanceStore() {
    const { subscribe, set, update } = writable({
        today: null,
        history: [],
        isLoading: false,
        error: null
    });

    return {
        subscribe,

        // Get today's attendance
        async fetchToday() {
            update(s => ({ ...s, isLoading: true, error: null }));
            try {
                const result = await api.getTodayAttendance();
                update(s => ({ ...s, today: result.data, isLoading: false }));
                return result.data;
            } catch (error) {
                update(s => ({ ...s, error: error.message, isLoading: false }));
                throw error;
            }
        },

        // Check in
        async checkIn() {
            update(s => ({ ...s, isLoading: true, error: null }));
            try {
                const result = await api.checkIn({ source: 'web' });
                update(s => ({ ...s, today: result.data, isLoading: false }));
                return result.data;
            } catch (error) {
                update(s => ({ ...s, error: error.message, isLoading: false }));
                throw error;
            }
        },

        // Check out
        async checkOut() {
            update(s => ({ ...s, isLoading: true, error: null }));
            try {
                const result = await api.checkOut();
                update(s => ({ ...s, today: result.data, isLoading: false }));
                return result.data;
            } catch (error) {
                update(s => ({ ...s, error: error.message, isLoading: false }));
                throw error;
            }
        },

        // Get history
        async fetchHistory(params = {}) {
            update(s => ({ ...s, isLoading: true, error: null }));
            try {
                const result = await api.getAttendanceHistory(params);
                update(s => ({ ...s, history: result.data, isLoading: false }));
                return result.data;
            } catch (error) {
                update(s => ({ ...s, error: error.message, isLoading: false }));
                throw error;
            }
        },

        // Clear error
        clearError() {
            update(s => ({ ...s, error: null }));
        },

        // Reset store
        reset() {
            set({ today: null, history: [], isLoading: false, error: null });
        }
    };
}

export const attendance = createAttendanceStore();

// Derived stores
export const hasCheckedIn = derived(
    attendance,
    $attendance => $attendance.today?.check_in != null
);

export const hasCheckedOut = derived(
    attendance,
    $attendance => $attendance.today?.check_out != null
);

export const todayStatus = derived(
    attendance,
    $attendance => $attendance.today?.status || null
);

export default attendance;
