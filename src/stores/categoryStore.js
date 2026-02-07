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
  categories: [],
  currentCategory: null,
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

export const useCategoryStore = create((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  setPage: (page) => {
    set(state => ({ pagination: { ...state.pagination, page } }));
  },

  fetchCategories: async () => {
    const hasFetched = get()._hasFetched;
    set({ isLoading: !hasFetched, error: null });
    try {
      const { filters, pagination } = get();
      const response = await fetch(`${API_BASE_URL}/api/category/filter`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: filters.name || null,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const response_data = await response.json();

      const payload = response_data.data || response_data;
      const items = payload.dataList || payload.items || payload.data || [];
      const totalCount = payload.totalCount || items.length;
      const totalPages = payload.totalPages || Math.ceil(totalCount / pagination.pageSize);

      set({
        categories: Array.isArray(items) ? items : [],
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

  getCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }

      const data = await response.json();
      set({ currentCategory: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', categoryData.name || '');
      formData.append('alias', categoryData.alias || '');
      formData.append('isActive', categoryData.isActive ?? true);

      if (categoryData.image instanceof File) {
        formData.append('images', categoryData.image);
      }

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/category`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create category');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchCategories();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', categoryData.name || '');
      formData.append('alias', categoryData.alias || '');
      formData.append('isActive', categoryData.isActive ?? true);

      if (categoryData.image instanceof File) {
        formData.append('images', categoryData.image);
      } else if (categoryData.imageUrl) {
        formData.append('imageUrl', categoryData.imageUrl);
      }

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update category');
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchCategories();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      set({ isLoading: false });

      get().fetchCategories();

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}));

export default useCategoryStore;
