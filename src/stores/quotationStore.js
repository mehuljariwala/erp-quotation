import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from './authStore';

const API_BASE_URL = 'https://apiord.maitriceramic.com';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const createEmptyQuotation = (vchNo) => ({
  id: null,
  vchNo,
  vchDate: new Date().toISOString().split('T')[0],
  party: null,
  reference: null,
  remark: '',
  email: '',
  salesman: null,
  priceList: 'MRP',
  priceId: 0,
  lineItems: [],
  totals: {
    totalItems: 0,
    grossAmount: 0,
    discountAmount: 0,
    taxableAmount: 0,
    gstAmount: 0,
    netAmount: 0
  },
  status: 'draft',
  createdAt: null
});

const calculateLineItem = (item) => {
  const grossAmount = item.mrp * item.qty;
  const discAmount = (grossAmount * item.discPercent) / 100;
  const taxableAmount = grossAmount - discAmount;
  const gstAmount = (taxableAmount * item.gstPercent) / 100;
  const netAmount = taxableAmount + gstAmount;

  return {
    ...item,
    grossAmount: Math.round(grossAmount * 100) / 100,
    discAmount: Math.round(discAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100
  };
};

const calculateTotals = (lineItems) => ({
  totalItems: lineItems.length,
  grossAmount: Math.round(lineItems.reduce((sum, item) => sum + item.grossAmount, 0) * 100) / 100,
  discountAmount: Math.round(lineItems.reduce((sum, item) => sum + item.discAmount, 0) * 100) / 100,
  taxableAmount: Math.round(lineItems.reduce((sum, item) => sum + item.taxableAmount, 0) * 100) / 100,
  gstAmount: Math.round(lineItems.reduce((sum, item) => sum + item.gstAmount, 0) * 100) / 100,
  netAmount: Math.round(lineItems.reduce((sum, item) => sum + item.netAmount, 0) * 100) / 100
});

const serializeAccDet = (acc) => {
  if (!acc) return null;
  return JSON.stringify({
    unId: acc.id || '',
    emailId: acc.email || '',
    mobileNo: acc.phone || '',
    imageUrl: acc.imageUrl || ''
  });
};

const mapToApiFormat = (quotation) => {
  const selectedOrg = useAuthStore.getState().selectedOrg;
  const unOrgId = selectedOrg?.unId || null;

  return {
    id: quotation.id || uuidv4(),
    unOrgId: unOrgId,
    vchDate: quotation.vchDate,
    priceId: quotation.priceId || 0,
    priceName: quotation.priceList || 'MRP',
    vchBookId: 1,
    jsVchBook: null,
    vchNo: String(quotation.vchNo),
    unAccId: quotation.party?.id || null,
    accName: quotation.party?.name || '',
    jsAccDet: serializeAccDet(quotation.party),
    unRefId: quotation.reference?.id || null,
    refName: quotation.reference?.name || '',
    jsRefDet: serializeAccDet(quotation.reference),
    remark1: quotation.remark || '',
    remark2: quotation.email || '',
    quotationDet: quotation.lineItems.map((item, index) => ({
      unRowId: item.id || uuidv4(),
      srNo: index + 1,
      area: item.area || '',
      priceId: quotation.priceId || 0,
      priceName: quotation.priceList || 'MRP',
      productId: item.product?.id || 0,
      productName: item.product?.name || item.description || '',
      productSkuCode: item.skuCode || '',
      productImageUrl: item.image || item.product?.imageUrl || '',
      pcs: 0,
      qty: item.qty || 0,
      mrp: item.mrp || 0,
      grossPrice: item.qty ? (item.grossAmount / item.qty) : item.mrp || 0,
      grossAmount: item.grossAmount || 0,
      discPer: item.discPercent || 0,
      discAmount: item.discAmount || 0,
      taxAmount: item.taxableAmount || 0,
      gstPer: item.gstPercent || 18,
      gstAmount: item.gstAmount || 0,
      netPrice: item.qty ? (item.netAmount / item.qty) : 0,
      netAmount: item.netAmount || 0,
      shortNarr1: '',
      shortNarr2: ''
    }))
  };
};

const parseAccDet = (jsonStr, fallbackId, fallbackName) => {
  if (!jsonStr) return fallbackId ? { id: fallbackId, name: fallbackName || '' } : null;
  try {
    const raw = JSON.parse(jsonStr);
    return {
      id: raw.unId || raw.id || fallbackId,
      name: raw.name || fallbackName || '',
      alias: raw.alias || '',
      email: raw.emailId || raw.email || '',
      phone: raw.mobileNo || raw.phone || '',
      city: raw.stateName || raw.city || '',
      imageUrl: raw.imageUrl || ''
    };
  } catch {
    return { id: fallbackId, name: fallbackName || '' };
  }
};

const mapFromApiFormat = (apiData) => ({
  id: apiData.id,
  vchNo: apiData.autoVchNo || parseInt(apiData.vchNo) || 0,
  vchNoDisplay: apiData.vchNo,
  vchDate: apiData.vchDate?.split('T')[0] || new Date().toISOString().split('T')[0],
  party: parseAccDet(apiData.jsAccDet, apiData.unAccId, apiData.accName),
  reference: parseAccDet(apiData.jsRefDet, apiData.unRefId, apiData.refName),
  remark: apiData.remark1 || '',
  email: apiData.remark2 || '',
  salesman: null,
  priceList: apiData.priceName || 'MRP',
  priceId: apiData.priceId || 0,
  lineItems: (apiData.quotationDet || []).map((det) => calculateLineItem({
    id: det.unRowId || det.id || uuidv4(),
    area: det.area || '',
    skuCode: det.productSkuCode || det.skuCode || '',
    product: { id: det.productId, name: det.productName, imageUrl: det.productImageUrl },
    image: det.productImageUrl || '',
    description: det.productName || '',
    mrp: det.mrp || 0,
    qty: det.qty || 0,
    discPercent: det.discPer ?? det.discPercent ?? 0,
    gstPercent: det.gstPer ?? det.gstPercent ?? 18
  })),
  status: 'draft',
  createdAt: apiData.createdAt
});

const mapFromListFormat = (item) => ({
  id: item.id,
  vchNo: item.autoVchNo || parseInt(item.vchNo) || 0,
  vchNoDisplay: item.vchNo,
  vchDate: item.vchDate?.split('T')[0] || '',
  party: { name: item.accName || '' },
  reference: item.refName ? { name: item.refName } : null,
  remark: item.remark1 || '',
  email: '',
  salesman: null,
  priceList: item.priceName || 'MRP',
  priceId: 0,
  lineItems: [],
  totals: {
    totalItems: 0,
    grossAmount: item.vchGrossAmount || 0,
    discountAmount: item.vchDiscAmount || 0,
    gstAmount: item.vchGSTAmount || 0,
    netAmount: item.vchNetAmount || 0
  },
  qty: item.vchQty || 0,
  pcs: item.vchPcs || 0,
  status: 'saved',
  createdAt: null
});

export const useQuotationStore = create(
  persist(
    (set, get) => ({
      quotations: [],
      currentQuotation: createEmptyQuotation(1),
      copiedItems: [],
      isLoading: false,
      error: null,

      searchParties: async (name) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/account/filter`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              name: name || '',
              page: 1,
              pageSize: 50
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch parties');
          }

          const result = await response.json();
          const payload = result.data || result;
          const items = payload.dataList || payload.items || payload.data || [];

          return items.map(acc => ({
            id: acc.id,
            name: acc.name,
            alias: acc.alias,
            email: acc.emailId,
            phone: acc.mobileNo1 || acc.mobileNo,
            city: acc.stateName,
            imageUrl: acc.imageUrl
          }));
        } catch (error) {
          console.error('Search parties failed:', error);
          return [];
        }
      },

      searchReferences: async (name) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/account/filter`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              name: name || '',
              accGrpType: 'Refrence',
              page: 1,
              pageSize: 50
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch references');
          }

          const result = await response.json();
          const payload = result.data || result;
          const items = payload.dataList || payload.items || payload.data || [];

          return items.map(acc => ({
            id: acc.id,
            name: acc.name,
            alias: acc.alias,
            email: acc.emailId,
            phone: acc.mobileNo1 || acc.mobileNo,
            city: acc.stateName,
            imageUrl: acc.imageUrl
          }));
        } catch (error) {
          console.error('Search references failed:', error);
          return [];
        }
      },

      lookupProductBySku: async (skuCode, priceId = 0) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/lookUp/product`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              skuCode: skuCode || '',
              priceId: priceId
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch product');
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || 'Failed to fetch product');
          }

          return result.data;
        } catch (error) {
          console.error('Product lookup failed:', error);
          return [];
        }
      },

      setParty: (party) => set(state => ({
        currentQuotation: {
          ...state.currentQuotation,
          party,
          email: party?.email || state.currentQuotation.email
        }
      })),

      setReference: (reference) => set(state => ({
        currentQuotation: { ...state.currentQuotation, reference }
      })),

      setRemark: (remark) => set(state => ({
        currentQuotation: { ...state.currentQuotation, remark }
      })),

      setEmail: (email) => set(state => ({
        currentQuotation: { ...state.currentQuotation, email }
      })),

      setSalesman: (salesman) => set(state => ({
        currentQuotation: { ...state.currentQuotation, salesman }
      })),

      setPriceList: (priceList) => set(state => {
        const lineItems = state.currentQuotation.lineItems.map(item => {
          if (item.product && item.product.prices) {
            const newMrp = item.product.prices[priceList] || item.product.prices.MRP;
            return calculateLineItem({ ...item, mrp: newMrp, priceList });
          }
          return { ...item, priceList };
        });
        return {
          currentQuotation: {
            ...state.currentQuotation,
            priceList,
            lineItems,
            totals: calculateTotals(lineItems)
          }
        };
      }),

      setVchDate: (vchDate) => set(state => ({
        currentQuotation: { ...state.currentQuotation, vchDate }
      })),

      addLineItem: () => {
        const newItem = {
          id: uuidv4(),
          area: '',
          priceList: get().currentQuotation.priceList,
          skuCode: '',
          product: null,
          image: null,
          description: '',
          mrp: 0,
          qty: 1,
          grossAmount: 0,
          discPercent: 0,
          discAmount: 0,
          taxableAmount: 0,
          gstPercent: 18,
          gstAmount: 0,
          netAmount: 0
        };

        set(state => ({
          currentQuotation: {
            ...state.currentQuotation,
            lineItems: [...state.currentQuotation.lineItems, newItem],
            totals: calculateTotals([...state.currentQuotation.lineItems, newItem])
          }
        }));

        return newItem.id;
      },

      updateLineItem: (id, field, value) => {
        set(state => {
          const lineItems = state.currentQuotation.lineItems.map(item => {
            if (item.id !== id) return item;

            let updatedItem = { ...item, [field]: value };

            if (['mrp', 'qty', 'discPercent', 'gstPercent'].includes(field)) {
              updatedItem = calculateLineItem(updatedItem);
            }

            return updatedItem;
          });

          return {
            currentQuotation: {
              ...state.currentQuotation,
              lineItems,
              totals: calculateTotals(lineItems)
            }
          };
        });
      },

      setProductForLineItem: (id, product) => {
        set(state => {
          const lineItems = state.currentQuotation.lineItems.map(item => {
            if (item.id !== id) return item;

            const mrp = product.mrp || product.saleRate || 0;
            const discPercent = product.discPer || item.discPercent || 0;
            const gstPercent = product.taxPer || product.gstPercent || 18;

            const updatedItem = calculateLineItem({
              ...item,
              product,
              skuCode: product.skuCode || product.alias,
              description: product.name,
              image: product.imageUrl || product.image,
              mrp,
              discPercent,
              gstPercent
            });

            return updatedItem;
          });

          return {
            currentQuotation: {
              ...state.currentQuotation,
              lineItems,
              totals: calculateTotals(lineItems)
            }
          };
        });
      },

      setProductFromSku: async (id, skuCode) => {
        try {
          const priceId = get().currentQuotation.priceId || 0;
          const products = await get().lookupProductBySku(skuCode, priceId);

          if (products && products.length > 0) {
            const product = products[0];
            get().setProductForLineItem(id, product);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to lookup product by SKU:', error);
          return false;
        }
      },

      deleteLineItem: (id) => {
        set(state => {
          const lineItems = state.currentQuotation.lineItems.filter(item => item.id !== id);
          return {
            currentQuotation: {
              ...state.currentQuotation,
              lineItems,
              totals: calculateTotals(lineItems)
            }
          };
        });
      },

      applyOverallDiscount: (discPercent) => {
        set(state => {
          const lineItems = state.currentQuotation.lineItems.map(item =>
            calculateLineItem({ ...item, discPercent })
          );
          return {
            currentQuotation: {
              ...state.currentQuotation,
              lineItems,
              totals: calculateTotals(lineItems)
            }
          };
        });
      },

      copyLineItems: (ids) => {
        const items = get().currentQuotation.lineItems.filter(item => ids.includes(item.id));
        set({ copiedItems: items });
      },

      pasteLineItems: () => {
        const copiedItems = get().copiedItems;
        if (copiedItems.length === 0) return;

        set(state => {
          const newItems = copiedItems.map(item => ({
            ...item,
            id: uuidv4()
          }));
          const lineItems = [...state.currentQuotation.lineItems, ...newItems];
          return {
            currentQuotation: {
              ...state.currentQuotation,
              lineItems,
              totals: calculateTotals(lineItems)
            }
          };
        });
      },

      clearCopiedItems: () => set({ copiedItems: [] }),

      saveQuotation: async () => {
        const current = get().currentQuotation;
        if (!current.party) return { success: false, error: 'Please select a party' };

        set({ isLoading: true, error: null });

        try {
          const apiData = mapToApiFormat(current);
          let response;

          if (current.id) {
            response = await fetch(`${API_BASE_URL}/api/quotation/${current.id}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify(apiData)
            });
          } else {
            response = await fetch(`${API_BASE_URL}/api/quotation`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(apiData)
            });
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to save quotation');
          }

          const result = await response.json();
          const savedId = result.data?.id || result.id || apiData.id;

          set(state => ({
            isLoading: false,
            currentQuotation: {
              ...state.currentQuotation,
              id: savedId
            }
          }));

          get().fetchQuotations();

          return { success: true, id: savedId };
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      newQuotation: () => {
        const quotations = get().quotations;
        const nextVchNo = quotations.length > 0
          ? Math.max(...quotations.map(q => q.vchNo || 0), 0) + 1
          : 1;
        set({ currentQuotation: createEmptyQuotation(nextVchNo) });
      },

      loadQuotation: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/quotation/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
          });

          if (!response.ok) {
            throw new Error('Failed to fetch quotation');
          }

          const result = await response.json();
          if (result.success !== false && result.data) {
            const quotation = mapFromApiFormat(result.data);
            quotation.totals = calculateTotals(quotation.lineItems);
            set({ currentQuotation: quotation, isLoading: false });
            return { success: true };
          } else {
            set({ isLoading: false, error: result.message });
            return { success: false, error: result.message };
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      fetchQuotations: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const selectedOrg = useAuthStore.getState().selectedOrg;

          const response = await fetch(`${API_BASE_URL}/api/quotation/filter`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              unOrgId: selectedOrg?.unId || filters.unOrgId,
              yearCode: filters.yearCode || new Date().getFullYear(),
              accName: filters.accName || '',
              vchNo: filters.vchNo || '',
              page: filters.page || 1,
              pageSize: filters.pageSize || 20
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch quotations');
          }

          const result = await response.json();
          if (result.success !== false) {
            const payload = result.data || result;
            const items = payload.dataList || payload.items || payload.data || [];
            const totalCount = payload.totalCount || items.length;
            const totalPages = payload.totalPages || Math.ceil(totalCount / (filters.pageSize || 20));

            const quotations = items.map(mapFromListFormat);
            set({ quotations, isLoading: false });

            const detailResults = await Promise.allSettled(
              items.map(item =>
                fetch(`${API_BASE_URL}/api/quotation/${item.id}`, {
                  headers: getAuthHeaders()
                }).then(r => r.ok ? r.json() : null)
              )
            );

            const enriched = quotations.map((q, i) => {
              const detail = detailResults[i]?.value?.data;
              if (!detail?.quotationDet) return q;
              const lineItems = detail.quotationDet.map(det => ({
                ...calculateLineItem({
                  id: det.unRowId || uuidv4(),
                  mrp: det.mrp || 0,
                  qty: det.qty || 0,
                  discPercent: det.discPer ?? 0,
                  gstPercent: det.gstPer ?? 18
                }),
                area: det.area || '',
                skuCode: det.productSkuCode || '',
                productName: det.productName || '',
                productImageUrl: det.productImageUrl || '',
                priceName: det.priceName || ''
              }));
              return { ...q, lineItems, totals: calculateTotals(lineItems), qty: q.qty };
            });
            set({ quotations: enriched });

            return { success: true, data: enriched, totalCount, totalPages };
          } else {
            set({ isLoading: false, error: result.message });
            return { success: false, error: result.message };
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      deleteQuotation: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/quotation/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });

          if (!response.ok) {
            throw new Error('Failed to delete quotation');
          }

          const result = await response.json();
          if (result.success !== false) {
            set(state => ({
              quotations: state.quotations.filter(q => q.id !== id),
              isLoading: false
            }));

            if (get().currentQuotation.id === id) {
              get().newQuotation();
            }
            return { success: true };
          } else {
            set({ isLoading: false, error: result.message });
            return { success: false, error: result.message };
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      duplicateQuotation: (id) => {
        const quotation = get().quotations.find(q => q.id === id);
        if (!quotation) return;

        const quotations = get().quotations;
        const nextVchNo = Math.max(...quotations.map(q => q.vchNo || 0), 0) + 1;
        const newQuotation = {
          ...quotation,
          id: null,
          vchNo: nextVchNo,
          vchDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          createdAt: null,
          lineItems: quotation.lineItems.map(item => ({ ...item, id: uuidv4() }))
        };

        set({ currentQuotation: newQuotation });
      }
    }),
    {
      name: 'quotation-storage',
      partialize: (state) => ({ quotations: state.quotations })
    }
  )
);

export default useQuotationStore;
