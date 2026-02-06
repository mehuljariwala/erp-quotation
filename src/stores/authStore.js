import { create } from 'zustand';
import { createStore } from './middleware';

const API_BASE_URL = 'https://apiord.maitriceramic.com';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  permissions: [],
  lastActivity: null,
  sessionExpiry: null,
  error: null,
  organizationsUser: [],
  selectedOrg: null
};

export const useAuthStore = create(
  createStore('auth', (set, get) => ({
    ...initialState,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: credentials.username,
            password: credentials.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        const userData = data.userData || data;
        const user = {
          id: userData.id || userData.userId || data.userId,
          name: userData.userName || credentials.username,
          email: userData.email || credentials.username,
          role: userData.roleType || data.role || 'user',
          orgId: null
        };

        const orgs = data.organizationsUser || [];

        set({
          user,
          token: data.token || data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          permissions: data.permissions || ['quotation.create', 'quotation.edit', 'quotation.delete'],
          lastActivity: Date.now(),
          sessionExpiry: Date.now() + 8 * 60 * 60 * 1000,
          organizationsUser: orgs,
          selectedOrg: null
        });

        return { success: true };
      } catch (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
    },

    register: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: userData.username,
            password: userData.password,
            taxNo: userData.taxNo || '',
            orgName: userData.orgName || ''
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        set({ isLoading: false });
        return { success: true, data };
      } catch (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
    },

    verifyUsername: async (username) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/verify/${encodeURIComponent(username)}`);
        const data = await response.json();
        return { available: response.ok, data };
      } catch (error) {
        return { available: false, error: error.message };
      }
    },

    setSelectedOrg: (org) => {
      set(state => ({
        selectedOrg: org,
        user: state.user ? { ...state.user, orgId: org?.unId } : null
      }));
    },

    logout: () => {
      set(initialState);
    },

    updateLastActivity: () => {
      set({ lastActivity: Date.now() });
    },

    hasPermission: (permission) => {
      return get().permissions.includes(permission);
    },

    hasAnyPermission: (permissions) => {
      return permissions.some(p => get().permissions.includes(p));
    },

    hasAllPermissions: (permissions) => {
      return permissions.every(p => get().permissions.includes(p));
    },

    isSessionValid: () => {
      const { sessionExpiry, isAuthenticated } = get();
      return isAuthenticated && sessionExpiry && Date.now() < sessionExpiry;
    },

    refreshSession: () => {
      if (get().isAuthenticated) {
        set({ sessionExpiry: Date.now() + 8 * 60 * 60 * 1000 });
      }
    },

    updateUser: (updates) => {
      set(state => ({
        user: state.user ? { ...state.user, ...updates } : null
      }));
    },

    reset: () => set(initialState)
  }), {
    persist: true,
    persistOptions: {
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        sessionExpiry: state.sessionExpiry,
        organizationsUser: state.organizationsUser,
        selectedOrg: state.selectedOrg
      })
    }
  })
);

export const authSelectors = {
  useUser: () => useAuthStore(state => state.user),
  useIsAuthenticated: () => useAuthStore(state => state.isAuthenticated),
  usePermissions: () => useAuthStore(state => state.permissions),
  useIsLoading: () => useAuthStore(state => state.isLoading)
};

export default useAuthStore;
