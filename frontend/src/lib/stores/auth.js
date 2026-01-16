import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import api from '$lib/api/client.js';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });

    return {
        subscribe,

        // Initialize auth state from localStorage
        async init() {
            if (!browser) return;

            const token = localStorage.getItem('token');
            if (!token) {
                set({ user: null, isAuthenticated: false, isLoading: false });
                return;
            }

            try {
                const result = await api.getMe();
                set({
                    user: result.data,
                    isAuthenticated: true,
                    isLoading: false
                });
            } catch (error) {
                // Token invalid, clear it
                localStorage.removeItem('token');
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        },

        // Login
        async login(email, password) {
            const result = await api.login(email, password);
            set({
                user: result.data.user,
                isAuthenticated: true,
                isLoading: false
            });
            return result;
        },

        // Logout
        async logout() {
            try {
                await api.logout();
            } catch (e) {
                // Ignore logout errors
            }
            api.setToken(null);
            set({ user: null, isAuthenticated: false, isLoading: false });
        },

        // Update user data
        updateUser(userData) {
            update(state => ({
                ...state,
                user: { ...state.user, ...userData }
            }));
        }
    };
}

export const auth = createAuthStore();
export default auth;
