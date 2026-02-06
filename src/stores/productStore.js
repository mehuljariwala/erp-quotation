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
  products: [],
  currentProduct: null,
  isLoading: false,
  _hasFetched: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  },
  filters: {
    name: '',
    skuCode: '',
    companyId: null,
    categoryId: null
  }
};

export const useProductStore = create((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  setPage: (page) => {
    set(state => ({ pagination: { ...state.pagination, page } }));
  },

  fetchProducts: async () => {
    const hasFetched = get()._hasFetched;
    set({ isLoading: !hasFetched, error: null });
    try {
      const { filters, pagination } = get();
      const response = await fetch(`${API_BASE_URL}/api/product/filter`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: filters.name || null,
          skuCode: filters.skuCode || null,
          companyId: filters.companyId || null,
          categoryId: filters.categoryId || null,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const response_data = await response.json();

      const payload = response_data.data || response_data;
      const items = payload.dataList || payload.items || payload.data || [];
      const totalCount = payload.totalCount || items.length;
      const totalPages = payload.totalPages || Math.ceil(totalCount / pagination.pageSize);

      set({
        products: Array.isArray(items) ? items : [],
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

  getProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      const product = data.data || data;
      set({ currentProduct: product, isLoading: false });
      return product;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();

      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formData.append('images', value);
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create product');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchProducts();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();

      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formData.append('images', value);
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchProducts();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      set({ isLoading: false });

      get().fetchProducts();

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}));

export default useProductStore;
