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
  priceLists: [],
  currentPriceList: null,
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

export const usePriceListStore = create((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  setPage: (page) => {
    set(state => ({ pagination: { ...state.pagination, page } }));
  },

  fetchPriceLists: async () => {
    const hasFetched = get()._hasFetched;
    set({ isLoading: !hasFetched, error: null });
    try {
      const { filters, pagination } = get();
      const response = await fetch(`${API_BASE_URL}/api/pricelist/filter`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: filters.name || null,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price lists');
      }

      const response_data = await response.json();

      const payload = response_data.data || response_data;
      const items = payload.dataList || payload.items || payload.data || [];
      const totalCount = payload.totalCount || items.length;
      const totalPages = payload.totalPages || Math.ceil(totalCount / pagination.pageSize);

      set({
        priceLists: Array.isArray(items) ? items : [],
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

  getPriceList: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricelist/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price list');
      }

      const data = await response.json();
      set({ currentPriceList: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createPriceList: async (priceListData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', priceListData.name || '');
      formData.append('remark', priceListData.remark || '');
      formData.append('isActive', priceListData.isActive ?? true);

      if (priceListData.vchDate) {
        formData.append('vchDate', priceListData.vchDate);
      }

      if (priceListData.excelFile instanceof File) {
        formData.append('excelFile', priceListData.excelFile);
      }

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/pricelist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create price list');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchPriceLists();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updatePriceList: async (id, priceListData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', priceListData.name || '');
      formData.append('remark', priceListData.remark || '');
      formData.append('isActive', priceListData.isActive ?? true);

      if (priceListData.vchDate) {
        formData.append('vchDate', priceListData.vchDate);
      }

      if (priceListData.excelFile instanceof File) {
        formData.append('excelFile', priceListData.excelFile);
      }

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/pricelist/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update price list');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchPriceLists();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deletePriceList: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricelist/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete price list');
      }

      set({ isLoading: false });

      get().fetchPriceLists();

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}));

export default usePriceListStore;
