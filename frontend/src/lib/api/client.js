// API client for backend communication
// In production, PUBLIC_API_URL points to Render backend
// In dev, we use Vite proxy to /api
const API_BASE = import.meta.env.PUBLIC_API_URL || '/api';

class ApiClient {
    constructor() {
        this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    }

    setToken(token) {
        this.token = token;
        if (typeof localStorage !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    }

    // Auth endpoints
    async login(email, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (result.data?.token) {
            this.setToken(result.data.token);
        }
        return result;
    }

    async logout() {
        const result = await this.request('/auth/logout', { method: 'POST' });
        this.setToken(null);
        return result;
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // Attendance endpoints
    async checkIn(data = {}) {
        return this.request('/attendance/check-in', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async checkOut(data = {}) {
        return this.request('/attendance/check-out', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getTodayAttendance() {
        return this.request('/attendance/today');
    }

    async getAttendanceHistory(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/attendance/history${query ? `?${query}` : ''}`);
    }

    async getMonthlySummary(year, month) {
        return this.request(`/attendance/summary?year=${year}&month=${month}`);
    }

    async getAllAttendance(date) {
        return this.request(`/attendance/all?date=${date}`);
    }

    async getSchedule() {
        return this.request('/attendance/schedule');
    }

    // User endpoints
    async getUsers() {
        return this.request('/users');
    }

    async getUser(id) {
        return this.request(`/users/${id}`);
    }

    async createUser(data) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deactivateUser(id) {
        return this.request(`/users/${id}/deactivate`, {
            method: 'PATCH'
        });
    }

    async activateUser(id) {
        return this.request(`/users/${id}/activate`, {
            method: 'PATCH'
        });
    }

    // Location endpoints
    async getLocations() {
        return this.request('/locations');
    }

    async getActiveLocations() {
        return this.request('/locations/active');
    }

    async checkLocation(latitude, longitude) {
        return this.request(`/locations/check?latitude=${latitude}&longitude=${longitude}`);
    }

    async createLocation(data) {
        return this.request('/locations', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateLocation(id, data) {
        return this.request(`/locations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteLocation(id) {
        return this.request(`/locations/${id}`, {
            method: 'DELETE'
        });
    }
}

export const api = new ApiClient();
export default api;
