import { create } from 'zustand';
import { createStore } from './middleware';
import { v4 as uuidv4 } from 'uuid';

const createEmptyInvoice = (invoiceNo) => ({
  id: null,
  invoiceNo,
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: null,
  quotationId: null,
  party: null,
  billingAddress: null,
  shippingAddress: null,
  salesman: null,
  lineItems: [],
  totals: {
    itemCount: 0,
    grossAmount: 0,
    discountAmount: 0,
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalGstAmount: 0,
    roundOff: 0,
    netAmount: 0
  },
  payments: [],
  paidAmount: 0,
  balanceAmount: 0,
  status: 'draft',
  notes: '',
  termsAndConditions: '',
  createdAt: null,
  updatedAt: null
});

const calculateLineItem = (item) => {
  const grossAmount = item.rate * item.quantity;
  const discAmount = (grossAmount * item.discountPercent) / 100;
  const taxableAmount = grossAmount - discAmount;

  let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
  if (item.gstType === 'IGST') {
    igstAmount = (taxableAmount * item.gstPercent) / 100;
  } else {
    cgstAmount = (taxableAmount * item.gstPercent / 2) / 100;
    sgstAmount = (taxableAmount * item.gstPercent / 2) / 100;
  }

  const totalGst = cgstAmount + sgstAmount + igstAmount;
  const netAmount = taxableAmount + totalGst;

  return {
    ...item,
    grossAmount: Math.round(grossAmount * 100) / 100,
    discAmount: Math.round(discAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    igstAmount: Math.round(igstAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100
  };
};

const calculateTotals = (lineItems) => {
  const totals = lineItems.reduce((acc, item) => ({
    itemCount: acc.itemCount + 1,
    grossAmount: acc.grossAmount + item.grossAmount,
    discountAmount: acc.discountAmount + item.discAmount,
    taxableAmount: acc.taxableAmount + item.taxableAmount,
    cgstAmount: acc.cgstAmount + item.cgstAmount,
    sgstAmount: acc.sgstAmount + item.sgstAmount,
    igstAmount: acc.igstAmount + item.igstAmount,
    totalGstAmount: acc.totalGstAmount + item.cgstAmount + item.sgstAmount + item.igstAmount,
    netAmount: acc.netAmount + item.netAmount
  }), {
    itemCount: 0, grossAmount: 0, discountAmount: 0, taxableAmount: 0,
    cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalGstAmount: 0, netAmount: 0
  });

  const roundedNet = Math.round(totals.netAmount);
  totals.roundOff = Math.round((roundedNet - totals.netAmount) * 100) / 100;
  totals.netAmount = roundedNet;

  return Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, Math.round(v * 100) / 100])
  );
};

const initialState = {
  invoices: [],
  currentInvoice: createEmptyInvoice(1),
  isLoading: false,
  filters: {
    status: null,
    dateFrom: null,
    dateTo: null,
    partyId: null
  }
};

export const useInvoiceStore = create(
  createStore('invoice', (set, get) => ({
    ...initialState,

    setParty: (party) => {
      set(state => ({
        currentInvoice: {
          ...state.currentInvoice,
          party,
          billingAddress: party?.address || null
        }
      }));
    },

    setSalesman: (salesman) => {
      set(state => ({
        currentInvoice: { ...state.currentInvoice, salesman }
      }));
    },

    setDueDate: (dueDate) => {
      set(state => ({
        currentInvoice: { ...state.currentInvoice, dueDate }
      }));
    },

    setNotes: (notes) => {
      set(state => ({
        currentInvoice: { ...state.currentInvoice, notes }
      }));
    },

    addLineItem: () => {
      const newItem = {
        id: uuidv4(),
        productId: null,
        product: null,
        description: '',
        hsnCode: '',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        discountPercent: 0,
        gstPercent: 18,
        gstType: 'CGST_SGST',
        grossAmount: 0,
        discAmount: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        netAmount: 0
      };

      set(state => ({
        currentInvoice: {
          ...state.currentInvoice,
          lineItems: [...state.currentInvoice.lineItems, newItem],
          totals: calculateTotals([...state.currentInvoice.lineItems, newItem])
        }
      }));

      return newItem.id;
    },

    updateLineItem: (id, field, value) => {
      set(state => {
        const lineItems = state.currentInvoice.lineItems.map(item => {
          if (item.id !== id) return item;

          let updatedItem = { ...item, [field]: value };

          if (['rate', 'quantity', 'discountPercent', 'gstPercent', 'gstType'].includes(field)) {
            updatedItem = calculateLineItem(updatedItem);
          }

          return updatedItem;
        });

        return {
          currentInvoice: {
            ...state.currentInvoice,
            lineItems,
            totals: calculateTotals(lineItems)
          }
        };
      });
    },

    deleteLineItem: (id) => {
      set(state => {
        const lineItems = state.currentInvoice.lineItems.filter(item => item.id !== id);
        return {
          currentInvoice: {
            ...state.currentInvoice,
            lineItems,
            totals: calculateTotals(lineItems)
          }
        };
      });
    },

    createFromQuotation: (quotation) => {
      const nextInvoiceNo = Math.max(...get().invoices.map(i => i.invoiceNo), 0) + 1;

      const lineItems = quotation.lineItems.map(item => calculateLineItem({
        id: uuidv4(),
        productId: item.product?.id || null,
        product: item.product,
        description: item.description,
        hsnCode: item.product?.hsnCode || '',
        quantity: item.qty,
        unit: item.product?.unit || 'PCS',
        rate: item.mrp,
        discountPercent: item.discPercent,
        gstPercent: item.gstPercent,
        gstType: 'CGST_SGST'
      }));

      const invoice = {
        ...createEmptyInvoice(nextInvoiceNo),
        quotationId: quotation.id,
        party: quotation.party,
        salesman: quotation.salesman,
        lineItems,
        totals: calculateTotals(lineItems)
      };

      set({ currentInvoice: invoice });
      return invoice;
    },

    recordPayment: (payment) => {
      const paymentRecord = {
        id: uuidv4(),
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference || '',
        date: payment.date || new Date().toISOString().split('T')[0],
        notes: payment.notes || '',
        createdAt: new Date().toISOString()
      };

      set(state => {
        const payments = [...state.currentInvoice.payments, paymentRecord];
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const balanceAmount = state.currentInvoice.totals.netAmount - paidAmount;

        return {
          currentInvoice: {
            ...state.currentInvoice,
            payments,
            paidAmount,
            balanceAmount,
            status: balanceAmount <= 0 ? 'paid' : 'partial'
          }
        };
      });
    },

    saveInvoice: () => {
      const current = get().currentInvoice;
      if (!current.party) return { success: false, error: 'Party required' };

      const now = new Date().toISOString();
      const invoiceToSave = {
        ...current,
        id: current.id || uuidv4(),
        status: current.status === 'draft' ? 'issued' : current.status,
        createdAt: current.createdAt || now,
        updatedAt: now
      };

      set(state => {
        const existingIndex = state.invoices.findIndex(i => i.id === invoiceToSave.id);
        const invoices = existingIndex >= 0
          ? state.invoices.map(i => i.id === invoiceToSave.id ? invoiceToSave : i)
          : [...state.invoices, invoiceToSave];

        return { invoices, currentInvoice: invoiceToSave };
      });

      return { success: true, invoice: invoiceToSave };
    },

    loadInvoice: (id) => {
      const invoice = get().invoices.find(i => i.id === id);
      if (invoice) {
        set({ currentInvoice: { ...invoice } });
      }
    },

    newInvoice: () => {
      const nextInvoiceNo = Math.max(...get().invoices.map(i => i.invoiceNo), 0) + 1;
      set({ currentInvoice: createEmptyInvoice(nextInvoiceNo) });
    },

    deleteInvoice: (id) => {
      set(state => ({
        invoices: state.invoices.filter(i => i.id !== id)
      }));
      if (get().currentInvoice.id === id) {
        get().newInvoice();
      }
    },

    setFilters: (filters) => {
      set(state => ({
        filters: { ...state.filters, ...filters }
      }));
    },

    getFilteredInvoices: () => {
      const { invoices, filters } = get();
      return invoices.filter(invoice => {
        if (filters.status && invoice.status !== filters.status) return false;
        if (filters.partyId && invoice.party?.id !== filters.partyId) return false;
        if (filters.dateFrom && invoice.invoiceDate < filters.dateFrom) return false;
        if (filters.dateTo && invoice.invoiceDate > filters.dateTo) return false;
        return true;
      });
    },

    getOverdueInvoices: () => {
      const today = new Date().toISOString().split('T')[0];
      return get().invoices.filter(i =>
        i.status !== 'paid' && i.dueDate && i.dueDate < today
      );
    },

    getTotalReceivables: () => {
      return get().invoices
        .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((sum, i) => sum + i.balanceAmount, 0);
    },

    reset: () => set(initialState)
  }), {
    persist: true,
    persistOptions: {
      partialize: (state) => ({ invoices: state.invoices })
    }
  })
);

export const invoiceSelectors = {
  useInvoices: () => useInvoiceStore(state => state.invoices),
  useCurrentInvoice: () => useInvoiceStore(state => state.currentInvoice),
  useIsLoading: () => useInvoiceStore(state => state.isLoading),
  useFilters: () => useInvoiceStore(state => state.filters)
};

export default useInvoiceStore;
