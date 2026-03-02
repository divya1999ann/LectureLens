import { create } from 'zustand';
import { normalizeRole } from '../services/api';

/**
 * Normalizes a user object coming from the backend:
 *  - backend role: "TEACHER" / "ADMIN" / "STUDENT"
 *  - frontend expects: "teacher" / "admin" / "student"
 */
const normalizeUser = (user) =>
  user ? { ...user, role: normalizeRole(user.role) } : null;

// Rehydrate from localStorage on startup
const storedUser = localStorage.getItem('user');
const initialUser = storedUser ? normalizeUser(JSON.parse(storedUser)) : null;
const initialAccess = localStorage.getItem('accessToken') || null;
const initialRefresh = localStorage.getItem('refreshToken') || null;

const useAuthStore = create((set) => ({
  user: initialUser,
  accessToken: initialAccess,
  refreshToken: initialRefresh,
  isAuthenticated: !!initialAccess,

  /**
   * Called after successful login or register.
   * @param {object} user  - user object from backend
   * @param {string} accessToken
   * @param {string} refreshToken
   */
  login: (user, accessToken, refreshToken) => {
    const normalizedUser = normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user: normalizedUser, accessToken, refreshToken, isAuthenticated: true });
  },

  /** Update the stored user profile (e.g. after PUT /api/users/me/) */
  updateUser: (updates) =>
    set((state) => {
      const updated = { ...state.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    }),

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Legacy key cleanup
    localStorage.removeItem('token');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
