export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_PATHS = {
    AUTH_REGISTER: '/api/v1/auth/register',
    AUTH_LOGIN: '/api/v1/auth/login',
    AUTH_ME: '/api/v1/auth/me',
    AUTH_FORGOT: '/api/v1/auth/forgot-password',
    AUTH_RESET: '/api/v1/auth/reset-password',
    INCOME: '/api/v1/income',
    EXPENSE: '/api/v1/expenses',
    DASHBOARD: '/api/v1/dashboard',
};
