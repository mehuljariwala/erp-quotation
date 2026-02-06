import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useProductStore } from './productStore';
import { useQuotationStore } from './quotationStore';
import { useCompanyStore } from './companyStore';

const API_BASE_URL = 'https://apiord.maitriceramic.com';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const MAX_RESULTS_PER_CATEGORY = 5;
const DEBOUNCE_MS = 200;

const STATIC_ACTIONS = [
  { id: 'action-new-quotation', type: 'action', title: 'New Quotation', subtitle: 'Create a new quotation', icon: 'FilePlus', meta: {}, navigateTo: { module: 'quotation', action: 'new' } },
  { id: 'action-new-account', type: 'action', title: 'New Account', subtitle: 'Create a new account', icon: 'UserPlus', meta: {}, navigateTo: { module: 'account', action: 'new' } },
  { id: 'action-new-product', type: 'action', title: 'New Product', subtitle: 'Create a new product', icon: 'PackagePlus', meta: {}, navigateTo: { module: 'product', action: 'new' } },
  { id: 'action-new-company', type: 'action', title: 'New Company', subtitle: 'Create a new company', icon: 'Building2', meta: {}, navigateTo: { module: 'company', action: 'new' } },
  { id: 'action-dashboard', type: 'action', title: 'Go to Dashboard', subtitle: 'View dashboard overview', icon: 'LayoutDashboard', meta: {}, navigateTo: { module: 'dashboard' } },
  { id: 'action-quotations', type: 'action', title: 'Go to Quotations', subtitle: 'View all quotations', icon: 'FileText', meta: {}, navigateTo: { module: 'quotation' } },
  { id: 'action-accounts', type: 'action', title: 'Go to Accounts', subtitle: 'View all accounts', icon: 'Users', meta: {}, navigateTo: { module: 'account' } },
  { id: 'action-products', type: 'action', title: 'Go to Products', subtitle: 'View all products', icon: 'Package', meta: {}, navigateTo: { module: 'product' } },
];

let debounceTimer = null;

const searchAccounts = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lookUp/account`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: query, accGrpType: 'Account' })
    });

    if (!response.ok) return [];

    const result = await response.json();
    if (!result.success || !result.data) return [];

    return result.data.slice(0, MAX_RESULTS_PER_CATEGORY).map(acc => ({
      id: acc.id,
      type: 'account',
      title: acc.name,
      subtitle: [acc.mobileNo, acc.stateName].filter(Boolean).join(' - '),
      icon: 'User',
      meta: { email: acc.emailId, phone: acc.mobileNo, imageUrl: acc.imageUrl },
      navigateTo: { module: 'account', id: acc.id }
    }));
  } catch {
    return [];
  }
};

const searchProducts = (query) => {
  const products = useProductStore.getState().products;
  const q = query.toLowerCase();

  return products
    .filter(p => {
      const name = (p.name || '').toLowerCase();
      const sku = (p.skuCode || p.alias || '').toLowerCase();
      return name.includes(q) || sku.includes(q);
    })
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map(p => ({
      id: p.id,
      type: 'product',
      title: p.name,
      subtitle: p.skuCode || p.alias || '',
      icon: 'Package',
      meta: { mrp: p.mrp || p.saleRate, imageUrl: p.imageUrl },
      navigateTo: { module: 'product', id: p.id }
    }));
};

const searchQuotations = (query) => {
  const quotations = useQuotationStore.getState().quotations;
  const q = query.toLowerCase();

  return quotations
    .filter(qn => {
      const partyName = (qn.party?.name || '').toLowerCase();
      const vchNo = String(qn.vchNo || '').toLowerCase();
      const remark = (qn.remark || '').toLowerCase();
      return partyName.includes(q) || vchNo.includes(q) || remark.includes(q);
    })
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map(qn => ({
      id: qn.id,
      type: 'quotation',
      title: `#${qn.vchNo} - ${qn.party?.name || 'No Party'}`,
      subtitle: qn.remark || qn.vchDate || '',
      icon: 'FileText',
      meta: { date: qn.vchDate, amount: qn.totals?.netAmount },
      navigateTo: { module: 'quotation', id: qn.id }
    }));
};

const searchCompanies = (query) => {
  const companies = useCompanyStore.getState().companies;
  const q = query.toLowerCase();

  return companies
    .filter(c => (c.name || '').toLowerCase().includes(q))
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map(c => ({
      id: c.id,
      type: 'company',
      title: c.name,
      subtitle: c.alias || '',
      icon: 'Building2',
      meta: { imageUrl: c.imageUrl },
      navigateTo: { module: 'company', id: c.id }
    }));
};

const filterActions = (query) => {
  const q = query.toLowerCase();
  return STATIC_ACTIONS
    .filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q))
    .slice(0, MAX_RESULTS_PER_CATEGORY);
};

export const useSearchStore = create(
  persist(
    (set, get) => ({
      isOpen: false,
      query: '',
      results: { account: [], product: [], quotation: [], company: [], action: [] },
      recentSearches: [],
      selectedIndex: 0,
      activeCategory: 'all',
      isSearching: false,

      open: () => set({ isOpen: true, query: '', selectedIndex: 0, activeCategory: 'all', results: { account: [], product: [], quotation: [], company: [], action: STATIC_ACTIONS } }),
      close: () => {
        clearTimeout(debounceTimer);
        set({ isOpen: false, query: '', selectedIndex: 0, isSearching: false });
      },

      setQuery: (query) => {
        set({ query, selectedIndex: 0 });
        clearTimeout(debounceTimer);

        if (!query.trim()) {
          set({ results: { account: [], product: [], quotation: [], company: [], action: STATIC_ACTIONS }, isSearching: false });
          return;
        }

        set({ isSearching: true });
        debounceTimer = setTimeout(() => {
          get().search(query.trim());
        }, DEBOUNCE_MS);
      },

      search: async (query) => {
        if (!query) return;

        const [account, product, quotation, company] = await Promise.all([
          searchAccounts(query),
          Promise.resolve(searchProducts(query)),
          Promise.resolve(searchQuotations(query)),
          Promise.resolve(searchCompanies(query)),
        ]);
        const action = filterActions(query);

        if (get().query.trim() === query) {
          set({ results: { account, product, quotation, company, action }, isSearching: false });
        }
      },

      setSelectedIndex: (index) => set({ selectedIndex: index }),
      setActiveCategory: (category) => set({ activeCategory: category, selectedIndex: 0 }),

      addRecentSearch: (item) => {
        if (!item || !item.id) return;
        set(state => {
          const filtered = state.recentSearches.filter(s => s.id !== item.id);
          return { recentSearches: [item, ...filtered].slice(0, 5) };
        });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      getFlatResults: () => {
        const { results, activeCategory } = get();
        if (activeCategory !== 'all') {
          return results[activeCategory] || [];
        }
        return [
          ...results.action,
          ...results.quotation,
          ...results.account,
          ...results.product,
          ...results.company,
        ];
      },
    }),
    {
      name: 'erp-command-search',
      partialize: (state) => ({ recentSearches: state.recentSearches })
    }
  )
);

export default useSearchStore;
