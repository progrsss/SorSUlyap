// api.js - API Service Layer
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
    }

    getAuthHeaders() {
        return this.token ? {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    clearAuth() {
        this.token = null;
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    }

    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Network error' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(credentials) {
        const response = await this.request(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.token && response.user) {
            this.setToken(response.token);
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.user));
        }

        return response;
    }

    async register(userData) {
        return this.request(CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyOTP(otpData) {
        const response = await this.request(CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
            method: 'POST',
            body: JSON.stringify(otpData)
        });

        if (response.token && response.user) {
            this.setToken(response.token);
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.user));
        }

        return response;
    }

    async forgotPassword(email) {
        return this.request(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(resetData) {
        return this.request(CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
            method: 'POST',
            body: JSON.stringify(resetData)
        });
    }

    async getCurrentUser() {
        const response = await this.request(CONFIG.ENDPOINTS.AUTH.ME);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.user));
        return response.user;
    }

    // Data methods
    async getAnnouncements() {
        return this.request(CONFIG.ENDPOINTS.ANNOUNCEMENTS);
    }

    async createAnnouncement(announcement) {
        return this.request(CONFIG.ENDPOINTS.ANNOUNCEMENTS, {
            method: 'POST',
            body: JSON.stringify(announcement)
        });
    }

    async deleteAnnouncement(id) {
        return this.request(`${CONFIG.ENDPOINTS.ANNOUNCEMENTS}/${id}`, {
            method: 'DELETE'
        });
    }

    async getSchedules() {
        return this.request(CONFIG.ENDPOINTS.SCHEDULES);
    }

    async createSchedule(schedule) {
        return this.request(CONFIG.ENDPOINTS.SCHEDULES, {
            method: 'POST',
            body: JSON.stringify(schedule)
        });
    }

    async updateSchedule(id, schedule) {
        return this.request(`${CONFIG.ENDPOINTS.SCHEDULES}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(schedule)
        });
    }

    async deleteSchedule(id) {
        return this.request(`${CONFIG.ENDPOINTS.SCHEDULES}/${id}`, {
            method: 'DELETE'
        });
    }

    async getEvents() {
        return this.request(CONFIG.ENDPOINTS.EVENTS);
    }

    async getUsers() {
        return this.request(CONFIG.ENDPOINTS.USERS);
    }

    async checkHealth() {
        return this.request(CONFIG.ENDPOINTS.HEALTH);
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUserSync() {
        try {
            const userStr = localStorage.getItem(CONFIG.USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    hasRole(role) {
        const user = this.getCurrentUserSync();
        return user && user.role === role;
    }

    logout() {
        this.clearAuth();
        window.location.href = 'welcome.html';
    }
}

// Create global instance
const api = new ApiService();
window.api = api;

// Auto-refresh token on 401 errors
let originalRequest = window.fetch;
window.fetch = async function(...args) {
    const response = await originalRequest.apply(this, args);

    if (response.status === 401) {
        // Token expired or invalid
        api.clearAuth();
        // Redirect to login if not already there
        if (!window.location.pathname.includes('login.html') &&
            !window.location.pathname.includes('signup.html') &&
            !window.location.pathname.includes('welcome.html')) {
            window.location.href = 'login.html';
        }
    }

    return response;
};
