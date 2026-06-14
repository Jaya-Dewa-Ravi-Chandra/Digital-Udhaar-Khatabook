import { create } from "zustand";
import axios from "axios";

const API = "http://localhost:4000/api/common";

export const useAuthStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // ── Sign Up ───────────────────────────────────────────
  signup: async (userData) => {
    try {
      set({ loading: true, error: null });
      await axios.post(`${API}/signup`, userData, { withCredentials: true });
      // auto signin after signup
      const res = await axios.post(
        `${API}/signin`,
        { email: userData.email, password: userData.password },
        { withCredentials: true }
      );
      set({
        currentUser: res.data?.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (err) {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Signup failed",
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // ── Sign In ───────────────────────────────────────────
  signin: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${API}/signin`, credentials, {
        withCredentials: true,
      });
      set({
        currentUser: res.data?.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return { success: true, user: res.data?.payload };
    } catch (err) {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Signin failed",
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // ── Sign Out ──────────────────────────────────────────
  signout: async () => {
    try {
      set({ loading: true });
      await axios.get(`${API}/Signout`, { withCredentials: true });
      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false };
    }
  },

  // ── Check Auth (page refresh) ─────────────────────────
  checkAuth: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(`${API}/check-auth`, {
        withCredentials: true,
      });
      if (!res.data?.payload) throw new Error("No payload");
      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return { success: true, user: res.data.payload };
    } catch {
      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
      return { success: false };
    }
  },

  // ── Change Password ───────────────────────────────────
  changePassword: async (passwords) => {
    try {
      set({ loading: true, error: null });
      await axios.put(`${API}/password`, passwords, { withCredentials: true });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Password change failed",
      });
      return { success: false, message: err.response?.data?.message };
    }
  },

  // ── Clear Error ───────────────────────────────────────
  clearError: () => set({ error: null }),
}));