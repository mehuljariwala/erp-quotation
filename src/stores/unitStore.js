import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_BASE_URL = 'https://apiord.maitriceramic.com';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const initialState = {
  units: [],
  currentUnit: null,
  isLoading: false,
  _hasFetched: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 100000,
    totalCount: 0,
    totalPages: 0
  },
  filters: {
    name: ''
  }
};

export const useUnitStore = create((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  setPage: (page) => {
    set(state => ({ pagination: { ...state.pagination, page } }));
  },

  fetchUnits: async () => {
    const hasFetched = get()._hasFetched;
    set({ isLoading: !hasFetched, error: null });
    try {
      const { filters, pagination } = get();
      const response = await fetch(`${API_BASE_URL}/api/unit/filter`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: filters.name || null,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch units');
      }

      const response_data = await response.json();

      const payload = response_data.data || response_data;
      const items = payload.dataList || payload.items || payload.data || [];
      const totalCount = payload.totalCount || items.length;
      const totalPages = payload.totalPages || Math.ceil(totalCount / pagination.pageSize);

      set({
        units: Array.isArray(items) ? items : [],
        pagination: {
          ...get().pagination,
          totalCount,
          totalPages
        },
        isLoading: false,
        _hasFetched: true
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getUnit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/unit/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unit');
      }

      const data = await response.json();
      set({ currentUnit: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createUnit: async (unitData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/unit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: unitData.name || '',
          alias: unitData.alias || '',
          isActive: unitData.isActive ?? true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create unit');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchUnits();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateUnit: async (id, unitData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/unit/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: unitData.name || '',
          alias: unitData.alias || '',
          isActive: unitData.isActive ?? true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update unit');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchUnits();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteUnit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/unit/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete unit');
      }

      set({ isLoading: false });

      get().fetchUnits();

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}));

export default useUnitStore;
