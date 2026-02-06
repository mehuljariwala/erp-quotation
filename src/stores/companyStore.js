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
  companies: [],
  currentCompany: null,
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

export const useCompanyStore = create((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  setPage: (page) => {
    set(state => ({ pagination: { ...state.pagination, page } }));
  },

  fetchCompanies: async () => {
    const hasFetched = get()._hasFetched;
    set({ isLoading: !hasFetched, error: null });
    try {
      const { filters, pagination } = get();
      const response = await fetch(`${API_BASE_URL}/api/company/filter`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: filters.name || null,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const response_data = await response.json();

      const payload = response_data.data || response_data;
      const items = payload.dataList || payload.items || payload.data || [];
      const totalCount = payload.totalCount || items.length;
      const totalPages = payload.totalPages || Math.ceil(totalCount / pagination.pageSize);

      set({
        companies: Array.isArray(items) ? items : [],
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

  getCompany: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }

      const data = await response.json();
      set({ currentCompany: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createCompany: async (companyData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', companyData.name || '');
      formData.append('alias', companyData.alias || '');
      formData.append('isActive', companyData.isActive ?? true);

      if (companyData.image instanceof File) {
        formData.append('images', companyData.image);
      }

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/company`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create company');
      }

      const data = await response.json();
      set({ isLoading: false });

      // Refresh the list
      get().fetchCompanies();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateCompany: async (id, companyData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', companyData.name || '');
      formData.append('alias', companyData.alias || '');
      formData.append('isActive', companyData.isActive ?? true);

      if (companyData.image instanceof File) {
        formData.append('images', companyData.image);
      } else if (companyData.imageUrl) {
        formData.append('imageUrl', companyData.imageUrl);
      }

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update company');
      }

      const data = await response.json();
      set({ isLoading: false });

      // Refresh the list
      get().fetchCompanies();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteCompany: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      set({ isLoading: false });

      // Refresh the list
      get().fetchCompanies();

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}));

export default useCompanyStore;
