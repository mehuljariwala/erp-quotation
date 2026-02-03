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
  stats: {
    totalQuotations: 0,
    totalAccounts: 0,
    totalProducts: 0,
    totalCompanies: 0,
    quotationValue: 0,
    thisMonthQuotations: 0
  },
  recentQuotations: [],
  topAccounts: [],
  recentProducts: [],
  isLoading: false,
  error: null
};

export const useDashboardStore = create((set, get) => ({
  ...initialState,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });

    try {
      const user = useAuthStore.getState().user;
      const currentYear = new Date().getFullYear();

      const [quotationsRes, accountsRes, productsRes, companiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/quotation/filter`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            unOrgId: user?.orgId,
            yearCode: currentYear,
            accName: '',
            vchNo: '',
            page: 1,
            pageSize: 10
          })
        }),
        fetch(`${API_BASE_URL}/api/account/filter`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            page: 1,
            pageSize: 10
          })
        }),
        fetch(`${API_BASE_URL}/api/product/filter`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            page: 1,
            pageSize: 10
          })
        }),
        fetch(`${API_BASE_URL}/api/company/filter`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            page: 1,
            pageSize: 100
          })
        })
      ]);

      const [quotationsData, accountsData, productsData, companiesData] = await Promise.all([
        quotationsRes.ok ? quotationsRes.json() : { data: [] },
        accountsRes.ok ? accountsRes.json() : { data: [] },
        productsRes.ok ? productsRes.json() : { data: [] },
        companiesRes.ok ? companiesRes.json() : { data: [] }
      ]);

      const quotationPayload = quotationsData.data || quotationsData;
      const quotationItems = quotationPayload.dataList || quotationPayload.items || quotationPayload.data || [];
      const quotationTotal = quotationPayload.totalCount || quotationItems.length;

      const accountPayload = accountsData.data || accountsData;
      const accountItems = accountPayload.dataList || accountPayload.items || accountPayload.data || [];
      const accountTotal = accountPayload.totalCount || accountItems.length;

      const productPayload = productsData.data || productsData;
      const productItems = productPayload.dataList || productPayload.items || productPayload.data || [];
      const productTotal = productPayload.totalCount || productItems.length;

      const companyPayload = companiesData.data || companiesData;
      const companyItems = companyPayload.dataList || companyPayload.items || companyPayload.data || [];
      const companyTotal = companyPayload.totalCount || companyItems.length;

      let totalQuotationValue = 0;
      let thisMonthCount = 0;
      const currentMonth = new Date().getMonth();

      quotationItems.forEach(q => {
        const details = q.quotationDet || [];
        const quotationTotal = details.reduce((sum, d) => sum + (d.netAmount || 0), 0);
        totalQuotationValue += quotationTotal;

        const qDate = new Date(q.vchDate);
        if (qDate.getMonth() === currentMonth && qDate.getFullYear() === currentYear) {
          thisMonthCount++;
        }
      });

      set({
        stats: {
          totalQuotations: quotationTotal,
          totalAccounts: accountTotal,
          totalProducts: productTotal,
          totalCompanies: companyTotal,
          quotationValue: totalQuotationValue,
          thisMonthQuotations: thisMonthCount
        },
        recentQuotations: quotationItems.slice(0, 5).map(q => ({
          id: q.id,
          vchNo: q.vchNo,
          vchDate: q.vchDate,
          partyName: q.accName,
          itemCount: q.quotationDet?.length || 0,
          netAmount: q.quotationDet?.reduce((sum, d) => sum + (d.netAmount || 0), 0) || 0
        })),
        topAccounts: accountItems.slice(0, 5).map(a => ({
          id: a.id,
          name: a.name,
          alias: a.alias,
          city: a.stateName || a.city,
          phone: a.mobileNo,
          imageUrl: a.imageUrl
        })),
        recentProducts: productItems.slice(0, 6).map(p => ({
          id: p.id,
          name: p.name,
          skuCode: p.skuCode || p.alias,
          mrp: p.mrp || p.saleRate || 0,
          imageUrl: p.imageUrl,
          companyName: p.companyName
        })),
        isLoading: false
      });

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  reset: () => set(initialState)
}));

export default useDashboardStore;
