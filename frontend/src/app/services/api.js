/**
 * Central API service for LectureLens
 * Handles all communication with the Django REST backend at http://127.0.0.1:8000
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// ─── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor: silent token refresh on 401 ───────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken,
                    });
                    const newAccess = data.access;
                    localStorage.setItem('accessToken', newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest);
                } catch {
                    // Refresh failed — clear storage and redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Normalize backend role (TEACHER → teacher) */
export const normalizeRole = (role) =>
    typeof role === 'string' ? role.toLowerCase() : role;

/** Extract a user-friendly error message from an Axios error */
export const getErrorMessage = (error) => {
    if (!error.response) return 'Network error. Is the backend running?';
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data?.detail) return data.detail;
    if (data?.non_field_errors) return data.non_field_errors.join(' ');
    // Collect first field error
    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) return `${firstKey}: ${data[firstKey][0]}`;
    return 'An unexpected error occurred.';
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    /**
     * POST /api/auth/login/
     * Returns { access, refresh, user: { id, email, role, is_active, created_at } }
     */
    login: (email, password) =>
        api.post('/auth/login/', { email, password }),

    /**
     * POST /api/auth/register/
     * Returns { user, tokens: { access, refresh }, message }
     */
    register: ({ email, password, password_confirm, role, full_name }) =>
        api.post('/auth/register/', { email, password, password_confirm, role, full_name }),

    /**
     * POST /api/auth/logout/
     * Blacklists the refresh token
     */
    logout: (refreshToken) =>
        api.post('/auth/logout/', { refresh: refreshToken }),

    /**
     * POST /api/auth/refresh/
     */
    refresh: (refreshToken) =>
        api.post('/auth/refresh/', { refresh: refreshToken }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
    /** GET /api/users/me/ */
    getMe: () => api.get('/users/me/'),

    /** PATCH /api/users/me/ — partial update */
    updateMe: (data) => api.patch('/users/me/', data),

    /** GET /api/users/?role=STUDENT|TEACHER|ADMIN — admin only */
    list: (role) => api.get('/users/', { params: role ? { role } : {} }),
};

// ─── Courses (Subjects) ───────────────────────────────────────────────────────
export const coursesAPI = {
    /** GET /api/courses/ — optionally filter by ?teacher=<id> */
    list: (teacherId) =>
        api.get('/courses/', { params: teacherId ? { teacher: teacherId } : {} }),

    /** POST /api/courses/ — teachers only */
    create: (data) => api.post('/courses/', data),

    /** GET /api/courses/{id}/ */
    get: (id) => api.get(`/courses/${id}/`),

    /** PUT /api/courses/{id}/ */
    update: (id, data) => api.put(`/courses/${id}/`, data),

    /** DELETE /api/courses/{id}/ */
    delete: (id) => api.delete(`/courses/${id}/`),
};

// ─── Lectures ─────────────────────────────────────────────────────────────────
export const lecturesAPI = {
    /** GET /api/lectures/ — optionally filter by ?subject=<id> */
    list: (subjectId) =>
        api.get('/lectures/', { params: subjectId ? { subject: subjectId } : {} }),

    /**
     * POST /api/lectures/ — multipart/form-data
     * Fields: subject (uuid), title, summary, audio_file (optional)
     */
    create: (formData) =>
        api.post('/lectures/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    /** GET /api/lectures/{id}/ */
    get: (id) => api.get(`/lectures/${id}/`),

    /** PUT /api/lectures/{id}/ */
    update: (id, data) => api.put(`/lectures/${id}/`, data),

    /** DELETE /api/lectures/{id}/ */
    delete: (id) => api.delete(`/lectures/${id}/`),
};

// ─── Transcriptions ───────────────────────────────────────────────────────────
export const transcriptionsAPI = {
    /** POST /api/transcriptions/{lecture_id}/start/ */
    start: (lectureId) => api.post(`/transcriptions/${lectureId}/start/`),

    /** GET /api/transcriptions/{lecture_id}/status/ */
    status: (lectureId) => api.get(`/transcriptions/${lectureId}/status/`),

    /** GET /api/transcriptions/{lecture_id}/ */
    get: (lectureId) => api.get(`/transcriptions/${lectureId}/`),
};

// ─── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
    /** GET /api/chat/sessions/?subject=<id> */
    getSessions: (subjectId) =>
        api.get('/chat/sessions/', { params: subjectId ? { subject: subjectId } : {} }),

    /** GET /api/chat/sessions/{id}/ */
    getSession: (sessionId) => api.get(`/chat/sessions/${sessionId}/`),

    /** DELETE /api/chat/sessions/{id}/ */
    deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}/`),

    /**
     * POST /api/chat/ask/
     * @param {string} question
     * @param {string[]} lectureIds  — UUIDs
     * @param {Array<{role:string, content:string}>} chatHistory
     * @param {string|null} sessionId  — existing session UUID (optional)
     * @param {string|null} subjectId  — subject UUID for new session (optional)
     */
    sendMessage: (question, lectureIds, chatHistory = [], sessionId = null, subjectId = null) =>
        api.post('/chat/ask/', {
            question,
            lecture_ids: lectureIds,
            chat_history: chatHistory,
            ...(sessionId && { session_id: sessionId }),
            ...(subjectId && { subject_id: subjectId }),
        }),
};

export default api;
