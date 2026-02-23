import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useProductStore } from './productStore';
import { useQuotationStore } from './quotationStore';
import { useCompanyStore } from './companyStore';
import { useAccountStore } from './accountStore';

const API_BASE_URL = 'https://apiord.maitriceramic.com';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const MAX_RESULTS_PER_CATEGORY = 6;
const DEBOUNCE_MS = 150;

const NAVIGATION_ACTIONS = [
  { id: 'nav-dashboard', type: 'action', title: 'Dashboard', subtitle: 'Overview & analytics', keywords: 'home overview stats analytics', navigateTo: { module: 'dashboard' } },
  { id: 'nav-quotation', type: 'action', title: 'Quotations', subtitle: 'View all quotations', keywords: 'quotes list voucher', navigateTo: { module: 'quotation' } },
  { id: 'nav-account', type: 'action', title: 'Accounts', subtitle: 'Manage parties & accounts', keywords: 'party customer client', navigateTo: { module: 'account' } },
  { id: 'nav-product', type: 'action', title: 'Products', subtitle: 'Product catalog', keywords: 'items inventory catalog', navigateTo: { module: 'product' } },
  { id: 'nav-company', type: 'action', title: 'Companies', subtitle: 'Manage companies', keywords: 'org brand manufacturer', navigateTo: { module: 'company' } },
  { id: 'nav-category', type: 'action', title: 'Categories', subtitle: 'Product categories', keywords: 'tags groups', navigateTo: { module: 'category' } },
  { id: 'nav-unit', type: 'action', title: 'Units', subtitle: 'Units of measurement', keywords: 'uom measure', navigateTo: { module: 'unit' } },
  { id: 'nav-pricelist', type: 'action', title: 'Price Lists', subtitle: 'Manage pricing', keywords: 'rate mrp cost pricing', navigateTo: { module: 'pricelist' } },
  { id: 'nav-report', type: 'action', title: 'Reports', subtitle: 'View reports', keywords: 'analytics data export', navigateTo: { module: 'report' } },
  { id: 'nav-user', type: 'action', title: 'Users', subtitle: 'User management', keywords: 'admin permissions roles', navigateTo: { module: 'user' } },
  { id: 'nav-final', type: 'action', title: 'Final Quotation', subtitle: 'View finalized quotations', keywords: 'approved confirmed', navigateTo: { module: 'final-quotation' } },
];

const CREATE_ACTIONS = [
  { id: 'create-quotation', type: 'create', title: 'New Quotation', subtitle: 'Create a quotation', keywords: 'add create new quote', navigateTo: { module: 'quotation', action: 'new' } },
  { id: 'create-account', type: 'create', title: 'New Account', subtitle: 'Add a new party', keywords: 'add create new party customer', navigateTo: { module: 'account', action: 'new' } },
  { id: 'create-product', type: 'create', title: 'New Product', subtitle: 'Add a product', keywords: 'add create new item', navigateTo: { module: 'product', action: 'new' } },
  { id: 'create-company', type: 'create', title: 'New Company', subtitle: 'Add a company', keywords: 'add create new brand', navigateTo: { module: 'company', action: 'new' } },
];

const fuzzyMatch = (text, query) => {
  if (!text || !query) return { match: false, score: 0 };
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  if (t === q) return { match: true, score: 100 };
  if (t.startsWith(q)) return { match: true, score: 90 };
  if (t.includes(q)) return { match: true, score: 70 };

  let ti = 0;
  let qi = 0;
  let score = 0;
  let consecutiveBonus = 0;

  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) {
      score += 10 + consecutiveBonus;
      consecutiveBonus += 5;
      qi++;
    } else {
      consecutiveBonus = 0;
    }
    ti++;
  }

  if (qi === q.length) {
    const completionRatio = q.length / t.length;
    return { match: true, score: Math.min(score * completionRatio, 65) };
  }

  return { match: false, score: 0 };
};

const parseIntent = (query) => {
  const q = query.toLowerCase().trim();

  const goPatterns = /^(go\s+to|open|show|navigate\s+to|switch\s+to|view)\s+(.+)/i;
  const goMatch = q.match(goPatterns);
  if (goMatch) return { type: 'navigate', target: goMatch[2].trim() };

  const createPatterns = /^(new|create|add)\s+(.+)/i;
  const createMatch = q.match(createPatterns);
  if (createMatch) return { type: 'create', target: createMatch[2].trim() };

  const quotationForPattern = /^quotation[s]?\s+(for|of|by)\s+(.+)/i;
  const qfMatch = q.match(quotationForPattern);
  if (qfMatch) return { type: 'quotation_search', target: qfMatch[2].trim() };

  const productPricePattern = /^products?\s+(above|over|below|under|more\s+than|less\s+than|greater\s+than)\s+(\d+)/i;
  const ppMatch = q.match(productPricePattern);
  if (ppMatch) {
    const op = ppMatch[1].toLowerCase();
    const price = parseInt(ppMatch[2]);
    const isAbove = ['above', 'over', 'more than', 'greater than'].some(w => op.includes(w));
    return { type: 'product_price', operator: isAbove ? 'above' : 'below', price };
  }

  const findPatterns = /^(find|search|look\s+for|where\s+is)\s+(.+)/i;
  const findMatch = q.match(findPatterns);
  if (findMatch) return { type: 'search', target: findMatch[2].trim() };

  if (/^\d+$/.test(q)) return { type: 'number_search', target: q };

  if (q.startsWith('#')) return { type: 'quotation_number', target: q.slice(1).trim() };

  return { type: 'general', target: q };
};

const searchAccountsAPI = async (query) => {
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
      subtitle: [acc.mobileNo, acc.stateName].filter(Boolean).join(' \u00b7 '),
      meta: { email: acc.emailId, phone: acc.mobileNo, city: acc.stateName, imageUrl: acc.imageUrl },
      navigateTo: { module: 'account', id: acc.id }
    }));
  } catch {
    return [];
  }
};

const searchAccountsLocal = (query) => {
  const accounts = useAccountStore.getState().accounts;
  const q = query.toLowerCase();

  return accounts
    .map(acc => {
      const nameMatch = fuzzyMatch(acc.name, q);
      const aliasMatch = fuzzyMatch(acc.alias, q);
      const phoneMatch = fuzzyMatch(acc.mobileNo1 || acc.mobileNo, q);
      const best = [nameMatch, aliasMatch, phoneMatch].sort((a, b) => b.score - a.score)[0];
      return { acc, score: best.score, match: best.match };
    })
    .filter(r => r.match)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map(({ acc }) => ({
      id: acc.id,
      type: 'account',
      title: acc.name,
      subtitle: [acc.mobileNo1 || acc.mobileNo, acc.stateName].filter(Boolean).join(' \u00b7 '),
      meta: { email: acc.emailId, phone: acc.mobileNo1 || acc.mobileNo, city: acc.stateName, imageUrl: acc.imageUrl, alias: acc.alias },
      navigateTo: { module: 'account', id: acc.id }
    }));
};

const searchProducts = (query, priceFilter) => {
  const products = useProductStore.getState().products;
  const q = query.toLowerCase();

  let filtered = products;

  if (priceFilter) {
    filtered = products.filter(p => {
      const mrp = p.mrp || p.saleRate || 0;
      return priceFilter.operator === 'above' ? mrp > priceFilter.price : mrp < priceFilter.price;
    });
  }

  if (!priceFilter) {
    filtered = filtered
      .map(p => {
        const nameMatch = fuzzyMatch(p.name, q);
        const skuMatch = fuzzyMatch(p.skuCode || p.alias, q);
        const best = [nameMatch, skuMatch].sort((a, b) => b.score - a.score)[0];
        return { p, score: best.score, match: best.match };
      })
      .filter(r => r.match)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS_PER_CATEGORY)
      .map(r => r.p);
  } else {
    filtered = filtered.slice(0, MAX_RESULTS_PER_CATEGORY);
  }

  return filtered.map(p => ({
    id: p.id,
    type: 'product',
    title: p.name,
    subtitle: [p.skuCode || p.alias, p.mrp || p.saleRate ? `\u20b9${(p.mrp || p.saleRate || 0).toLocaleString('en-IN')}` : ''].filter(Boolean).join(' \u00b7 '),
    meta: { mrp: p.mrp || p.saleRate, imageUrl: p.imageUrl, skuCode: p.skuCode || p.alias, companyName: p.companyName, categoryName: p.categoryName, hsnCode: p.hsnCode, gst: p.taxPer },
    navigateTo: { module: 'product', id: p.id }
  }));
};

const searchQuotations = (query, partyFilter) => {
  const quotations = useQuotationStore.getState().quotations;
  const q = (partyFilter || query).toLowerCase();

  return quotations
    .map(qn => {
      const partyMatch = fuzzyMatch(qn.party?.name, q);
      const vchMatch = fuzzyMatch(String(qn.vchNo || ''), q);
      const remarkMatch = fuzzyMatch(qn.remark, q);
      const best = [partyMatch, vchMatch, remarkMatch].sort((a, b) => b.score - a.score)[0];
      return { qn, score: best.score, match: best.match };
    })
    .filter(r => r.match)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map(({ qn }) => ({
      id: qn.id,
      type: 'quotation',
      title: `#${String(qn.vchNo).padStart(4, '0')} \u2014 ${qn.party?.name || 'No Party'}`,
      subtitle: [qn.vchDate, qn.totals?.netAmount ? `\u20b9${qn.totals.netAmount.toLocaleString('en-IN')}` : ''].filter(Boolean).join(' \u00b7 '),
      meta: { date: qn.vchDate, amount: qn.totals?.netAmount, partyName: qn.party?.name, items: qn.lineItems?.length || qn.qty || 0, remark: qn.remark },
      navigateTo: { module: 'quotation', id: qn.id }
    }));
};

const searchCompanies = (query) => {
  const companies = useCompanyStore.getState().companies;
  const q = query.toLowerCase();

  return companies
    .map(c => {
      const nameMatch = fuzzyMatch(c.name, q);
      const aliasMatch = fuzzyMatch(c.alias, q);
      const best = [nameMatch, aliasMatch].sort((a, b) => b.score - a.score)[0];
      return { c, score: best.score, match: best.match };
    })
    .filter(r => r.match)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map(({ c }) => ({
      id: c.id,
      type: 'company',
      title: c.name,
      subtitle: c.alias || '',
      meta: { imageUrl: c.imageUrl, alias: c.alias },
      navigateTo: { module: 'company', id: c.id }
    }));
};

const filterActions = (query, intent) => {
  const q = query.toLowerCase();
  const pool = intent?.type === 'create' ? CREATE_ACTIONS : [...NAVIGATION_ACTIONS, ...CREATE_ACTIONS];

  const target = intent?.target || q;

  return pool
    .map(a => {
      const titleMatch = fuzzyMatch(a.title, target);
      const subtitleMatch = fuzzyMatch(a.subtitle, target);
      const keywordsMatch = fuzzyMatch(a.keywords, target);
      const best = [titleMatch, subtitleMatch, keywordsMatch].sort((x, y) => y.score - x.score)[0];
      return { a, score: best.score, match: best.match };
    })
    .filter(r => r.match)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.a);
};

let debounceTimer = null;

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
      intent: null,

      open: () => set({
        isOpen: true,
        query: '',
        selectedIndex: 0,
        activeCategory: 'all',
        intent: null,
        results: { account: [], product: [], quotation: [], company: [], action: [] }
      }),

      close: () => {
        clearTimeout(debounceTimer);
        set({ isOpen: false, query: '', selectedIndex: 0, isSearching: false, intent: null });
      },

      toggle: () => {
        const isOpen = get().isOpen;
        if (isOpen) {
          get().close();
        } else {
          get().open();
        }
      },

      setQuery: (query) => {
        const intent = query.trim() ? parseIntent(query) : null;
        set({ query, selectedIndex: 0, intent });
        clearTimeout(debounceTimer);

        if (!query.trim()) {
          set({ results: { account: [], product: [], quotation: [], company: [], action: [] }, isSearching: false, intent: null });
          return;
        }

        set({ isSearching: true });
        debounceTimer = setTimeout(() => {
          get().search(query.trim(), intent);
        }, DEBOUNCE_MS);
      },

      search: async (query, intent) => {
        if (!query) return;

        const resolvedIntent = intent || parseIntent(query);
        let account = [];
        let product = [];
        let quotation = [];
        let company = [];
        let action = [];

        switch (resolvedIntent.type) {
          case 'navigate':
            action = filterActions(query, resolvedIntent);
            break;

          case 'create':
            action = filterActions(query, resolvedIntent);
            break;

          case 'quotation_search':
            quotation = searchQuotations(query, resolvedIntent.target);
            action = filterActions(query, resolvedIntent);
            break;

          case 'product_price':
            product = searchProducts(query, { operator: resolvedIntent.operator, price: resolvedIntent.price });
            break;

          case 'quotation_number':
            quotation = searchQuotations(resolvedIntent.target);
            break;

          case 'number_search':
            quotation = searchQuotations(resolvedIntent.target);
            product = searchProducts(resolvedIntent.target);
            break;

          default: {
            const [apiAccounts, localAccounts] = await Promise.all([
              searchAccountsAPI(query),
              Promise.resolve(searchAccountsLocal(query)),
            ]);

            const accountMap = new Map();
            [...apiAccounts, ...localAccounts].forEach(a => {
              if (!accountMap.has(a.id)) accountMap.set(a.id, a);
            });
            account = [...accountMap.values()].slice(0, MAX_RESULTS_PER_CATEGORY);

            product = searchProducts(query);
            quotation = searchQuotations(query);
            company = searchCompanies(query);
            action = filterActions(query, resolvedIntent);
            break;
          }
        }

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
          return { recentSearches: [item, ...filtered].slice(0, 8) };
        });
      },

      removeRecentSearch: (id) => {
        set(state => ({
          recentSearches: state.recentSearches.filter(s => s.id !== id)
        }));
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
