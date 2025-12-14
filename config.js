// config.js - Application Configuration
const API_BASE_URL = 'http://localhost:5000/api';

const CONFIG = {
    API_URL: API_BASE_URL,
    ENDPOINTS: {
        AUTH: {
            LOGIN: `${API_BASE_URL}/auth/login`,
            REGISTER: `${API_BASE_URL}/auth/register`,
            VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
            FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
            RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
            ME: `${API_BASE_URL}/auth/me`
        },
        ANNOUNCEMENTS: `${API_BASE_URL}/announcements`,
        SCHEDULES: `${API_BASE_URL}/schedules`,
        EVENTS: `${API_BASE_URL}/events`,
        NOTIFICATIONS: `${API_BASE_URL}/notifications`,
        USERS: `${API_BASE_URL}/users`,
        HEALTH: `${API_BASE_URL}/health`
    },
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    ROLE_KEY: 'userRole'
};

// Make config globally available
window.CONFIG = CONFIG;
