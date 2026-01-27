import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { sampleQuotations } from '../data/quotations';

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
  lineItems: [],
  totals: {
    itemCount: 0,
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
  itemCount: lineItems.length,
  grossAmount: Math.round(lineItems.reduce((sum, item) => sum + item.grossAmount, 0) * 100) / 100,
  discountAmount: Math.round(lineItems.reduce((sum, item) => sum + item.discAmount, 0) * 100) / 100,
  taxableAmount: Math.round(lineItems.reduce((sum, item) => sum + item.taxableAmount, 0) * 100) / 100,
  gstAmount: Math.round(lineItems.reduce((sum, item) => sum + item.gstAmount, 0) * 100) / 100,
  netAmount: Math.round(lineItems.reduce((sum, item) => sum + item.netAmount, 0) * 100) / 100
});

export const useQuotationStore = create(
  persist(
    (set, get) => ({
      quotations: sampleQuotations,
      currentQuotation: createEmptyQuotation(3),
      copiedItems: [],

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
        const priceList = get().currentQuotation.priceList;

        set(state => {
          const lineItems = state.currentQuotation.lineItems.map(item => {
            if (item.id !== id) return item;

            const mrp = product.prices[priceList] || product.prices.MRP;
            const updatedItem = calculateLineItem({
              ...item,
              product,
              skuCode: product.skuCode,
              description: product.name,
              image: product.image,
              mrp,
              gstPercent: product.gstPercent
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

      saveQuotation: () => {
        const current = get().currentQuotation;
        if (!current.party) return false;

        const now = new Date().toISOString();
        const quotationToSave = {
          ...current,
          id: current.id || uuidv4(),
          createdAt: current.createdAt || now,
          updatedAt: now
        };

        set(state => {
          const existingIndex = state.quotations.findIndex(q => q.id === quotationToSave.id);
          const quotations = existingIndex >= 0
            ? state.quotations.map(q => q.id === quotationToSave.id ? quotationToSave : q)
            : [...state.quotations, quotationToSave];

          return {
            quotations,
            currentQuotation: quotationToSave
          };
        });

        return true;
      },

      newQuotation: () => {
        const nextVchNo = Math.max(...get().quotations.map(q => q.vchNo), 0) + 1;
        set({ currentQuotation: createEmptyQuotation(nextVchNo) });
      },

      loadQuotation: (id) => {
        const quotation = get().quotations.find(q => q.id === id);
        if (quotation) {
          set({ currentQuotation: { ...quotation } });
        }
      },

      deleteQuotation: (id) => {
        set(state => ({
          quotations: state.quotations.filter(q => q.id !== id)
        }));

        if (get().currentQuotation.id === id) {
          get().newQuotation();
        }
      },

      duplicateQuotation: (id) => {
        const quotation = get().quotations.find(q => q.id === id);
        if (!quotation) return;

        const nextVchNo = Math.max(...get().quotations.map(q => q.vchNo), 0) + 1;
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
