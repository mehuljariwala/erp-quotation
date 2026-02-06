import { create } from "zustand";
import { useAuthStore } from "./authStore";

const API_BASE_URL = "https://apiord.maitriceramic.com";

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const initialState = {
  accounts: [],
  currentAccount: null,
  isLoading: false,
  _hasFetched: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 100000,
    totalCount: 0,
    totalPages: 0,
  },
  filters: {
    name: "",
  },
};

export const useAccountStore = create((set, get) => ({
  ...initialState,

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
  },

  fetchAccounts: async () => {
    const hasFetched = get()._hasFetched;
    set({ isLoading: !hasFetched, error: null });
    try {
      const { filters, pagination } = get();
      const response = await fetch(`${API_BASE_URL}/api/account/filter`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: filters.name || "",
          page: pagination.page,
          pageSize: pagination.pageSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const response_data = await response.json();

      const payload = response_data.data || response_data;
      const items = payload.dataList || payload.items || payload.data || [];
      const totalCount = payload.totalCount || items.length;
      const totalPages =
        payload.totalPages || Math.ceil(totalCount / pagination.pageSize);

      set({
        accounts: Array.isArray(items) ? items : [],
        pagination: {
          ...get().pagination,
          totalCount,
          totalPages,
        },
        isLoading: false,
        _hasFetched: true,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/account/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account");
      }

      const data = await response.json();
      const account = data.data || data;
      set({ currentAccount: account, isLoading: false });
      return account;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createAccount: async (accountData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();

      Object.entries(accountData).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          formData.append("images", value);
        } else if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create account");
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchAccounts();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateAccount: async (id, accountData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();

      Object.entries(accountData).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          formData.append("images", value);
        } else if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/account/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update account");
      }

      const data = await response.json();
      set({ isLoading: false });

      get().fetchAccounts();

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/account/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      set({ isLoading: false });

      get().fetchAccounts();

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

export default useAccountStore;
