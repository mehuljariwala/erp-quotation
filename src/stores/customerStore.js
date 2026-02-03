import { create } from 'zustand';
import { createStore } from './middleware';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  customers: [],
  selectedCustomer: null,
  customerGroups: [
    { id: 'retail', name: 'Retail', discount: 0 },
    { id: 'wholesale', name: 'Wholesale', discount: 5 },
    { id: 'distributor', name: 'Distributor', discount: 10 },
    { id: 'vip', name: 'VIP', discount: 15 }
  ],
  isLoading: false,
  searchQuery: '',
  filters: {
    group: null,
    city: null,
    status: 'active'
  }
};

export const useCustomerStore = create(
  createStore('customer', (set, get) => ({
    ...initialState,

    setCustomers: (customers) => set({ customers }),

    addCustomer: (customerData) => {
      const newCustomer = {
        id: uuidv4(),
        ...customerData,
        code: customerData.code || `CUST-${Date.now()}`,
        creditLimit: customerData.creditLimit || 0,
        currentBalance: 0,
        totalPurchases: 0,
        lastPurchaseDate: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      set(state => ({
        customers: [...state.customers, newCustomer]
      }));

      return newCustomer;
    },

    updateCustomer: (id, updates) => {
      set(state => ({
        customers: state.customers.map(c =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        )
      }));
    },

    deleteCustomer: (id) => {
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer
      }));
    },

    selectCustomer: (customer) => set({ selectedCustomer: customer }),

    clearSelectedCustomer: () => set({ selectedCustomer: null }),

    getCustomerById: (id) => get().customers.find(c => c.id === id),

    getCustomerByCode: (code) => get().customers.find(c => c.code === code),

    searchCustomers: (query) => {
      if (!query) return get().customers;
      const lowerQuery = query.toLowerCase();
      return get().customers.filter(c =>
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.code?.toLowerCase().includes(lowerQuery) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.city?.toLowerCase().includes(lowerQuery) ||
        c.gstNumber?.toLowerCase().includes(lowerQuery)
      );
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    setFilters: (filters) => {
      set(state => ({
        filters: { ...state.filters, ...filters }
      }));
    },

    getFilteredCustomers: () => {
      const { customers, filters, searchQuery } = get();

      let filtered = customers;

      if (searchQuery) {
        filtered = get().searchCustomers(searchQuery);
      }

      if (filters.group) {
        filtered = filtered.filter(c => c.group === filters.group);
      }

      if (filters.city) {
        filtered = filtered.filter(c => c.city === filters.city);
      }

      if (filters.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }

      return filtered;
    },

    updateBalance: (customerId, amount, type = 'add') => {
      set(state => ({
        customers: state.customers.map(c => {
          if (c.id !== customerId) return c;
          const newBalance = type === 'add'
            ? c.currentBalance + amount
            : c.currentBalance - amount;
          return { ...c, currentBalance: newBalance };
        })
      }));
    },

    recordPurchase: (customerId, amount) => {
      set(state => ({
        customers: state.customers.map(c => {
          if (c.id !== customerId) return c;
          return {
            ...c,
            totalPurchases: c.totalPurchases + amount,
            lastPurchaseDate: new Date().toISOString()
          };
        })
      }));
    },

    checkCreditLimit: (customerId, amount) => {
      const customer = get().getCustomerById(customerId);
      if (!customer) return { allowed: false, reason: 'Customer not found' };

      const availableCredit = customer.creditLimit - customer.currentBalance;
      if (amount > availableCredit) {
        return {
          allowed: false,
          reason: `Exceeds credit limit. Available: ₹${availableCredit.toFixed(2)}`
        };
      }

      return { allowed: true };
    },

    getCustomerStats: (customerId) => {
      const customer = get().getCustomerById(customerId);
      if (!customer) return null;

      return {
        totalPurchases: customer.totalPurchases,
        currentBalance: customer.currentBalance,
        availableCredit: customer.creditLimit - customer.currentBalance,
        creditUtilization: customer.creditLimit > 0
          ? (customer.currentBalance / customer.creditLimit) * 100
          : 0,
        lastPurchaseDate: customer.lastPurchaseDate
      };
    },

    addCustomerGroup: (group) => {
      const newGroup = {
        id: uuidv4(),
        ...group
      };
      set(state => ({
        customerGroups: [...state.customerGroups, newGroup]
      }));
      return newGroup;
    },

    updateCustomerGroup: (id, updates) => {
      set(state => ({
        customerGroups: state.customerGroups.map(g =>
          g.id === id ? { ...g, ...updates } : g
        )
      }));
    },

    getGroupDiscount: (groupId) => {
      const group = get().customerGroups.find(g => g.id === groupId);
      return group?.discount || 0;
    },

    getCitiesList: () => {
      const cities = new Set(get().customers.map(c => c.city).filter(Boolean));
      return Array.from(cities).sort();
    },

    getTopCustomers: (limit = 10) => {
      return [...get().customers]
        .sort((a, b) => b.totalPurchases - a.totalPurchases)
        .slice(0, limit);
    },

    getCustomersWithOverdueBalance: () => {
      return get().customers.filter(c => c.currentBalance > 0);
    },

    exportCustomers: () => {
      return JSON.stringify(get().customers, null, 2);
    },

    importCustomers: (data) => {
      try {
        const customers = JSON.parse(data);
        set(state => ({
          customers: [...state.customers, ...customers.map(c => ({
            ...c,
            id: uuidv4(),
            createdAt: new Date().toISOString()
          }))]
        }));
        return { success: true, count: customers.length };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    reset: () => set(initialState)
  }), {
    persist: true,
    persistOptions: {
      partialize: (state) => ({
        customers: state.customers,
        customerGroups: state.customerGroups
      })
    }
  })
);

export const customerSelectors = {
  useCustomers: () => useCustomerStore(state => state.customers),
  useSelectedCustomer: () => useCustomerStore(state => state.selectedCustomer),
  useCustomerGroups: () => useCustomerStore(state => state.customerGroups),
  useIsLoading: () => useCustomerStore(state => state.isLoading),
  useFilters: () => useCustomerStore(state => state.filters)
};

export default useCustomerStore;
