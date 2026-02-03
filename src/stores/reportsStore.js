import { create } from 'zustand';
import { createStore } from './middleware';

const initialState = {
  dashboardData: {
    totalSales: 0,
    totalQuotations: 0,
    pendingQuotations: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    receivables: 0,
    topProducts: [],
    topCustomers: [],
    salesTrend: [],
    quotationConversionRate: 0
  },
  dateRange: {
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First of current month
    to: new Date().toISOString().split('T')[0] // Today
  },
  isLoading: false,
  lastUpdated: null
};

export const useReportsStore = create(
  createStore('reports', (set, get) => ({
    ...initialState,

    setDateRange: (from, to) => {
      set({ dateRange: { from, to } });
    },

    refreshDashboard: (quotations, invoices, customers, products) => {
      set({ isLoading: true });

      const { dateRange } = get();
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      const filteredQuotations = quotations.filter(q => {
        const date = new Date(q.vchDate);
        return date >= fromDate && date <= toDate;
      });

      const filteredInvoices = invoices.filter(i => {
        const date = new Date(i.invoiceDate);
        return date >= fromDate && date <= toDate;
      });

      const totalSales = filteredInvoices.reduce((sum, i) => sum + (i.totals?.netAmount || 0), 0);
      const receivables = invoices
        .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((sum, i) => sum + (i.balanceAmount || 0), 0);

      const convertedQuotations = filteredQuotations.filter(q =>
        invoices.some(i => i.quotationId === q.id)
      ).length;

      const productSales = {};
      filteredInvoices.forEach(invoice => {
        invoice.lineItems?.forEach(item => {
          if (item.product) {
            const key = item.product.id;
            if (!productSales[key]) {
              productSales[key] = {
                product: item.product,
                totalQty: 0,
                totalAmount: 0
              };
            }
            productSales[key].totalQty += item.quantity || 0;
            productSales[key].totalAmount += item.netAmount || 0;
          }
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      const customerSales = {};
      filteredInvoices.forEach(invoice => {
        if (invoice.party) {
          const key = invoice.party.id;
          if (!customerSales[key]) {
            customerSales[key] = {
              customer: invoice.party,
              totalInvoices: 0,
              totalAmount: 0
            };
          }
          customerSales[key].totalInvoices += 1;
          customerSales[key].totalAmount += invoice.totals?.netAmount || 0;
        }
      });

      const topCustomers = Object.values(customerSales)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      const salesByDate = {};
      filteredInvoices.forEach(invoice => {
        const date = invoice.invoiceDate;
        if (!salesByDate[date]) {
          salesByDate[date] = 0;
        }
        salesByDate[date] += invoice.totals?.netAmount || 0;
      });

      const salesTrend = Object.entries(salesByDate)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

      set({
        dashboardData: {
          totalSales,
          totalQuotations: filteredQuotations.length,
          pendingQuotations: filteredQuotations.filter(q => q.status === 'draft').length,
          totalInvoices: filteredInvoices.length,
          pendingInvoices: filteredInvoices.filter(i => i.status !== 'paid').length,
          receivables,
          topProducts,
          topCustomers,
          salesTrend,
          quotationConversionRate: filteredQuotations.length > 0
            ? (convertedQuotations / filteredQuotations.length) * 100
            : 0
        },
        isLoading: false,
        lastUpdated: new Date().toISOString()
      });
    },

    getSalesReport: (invoices, groupBy = 'day') => {
      const { dateRange } = get();
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      const filtered = invoices.filter(i => {
        const date = new Date(i.invoiceDate);
        return date >= fromDate && date <= toDate;
      });

      const grouped = {};
      filtered.forEach(invoice => {
        let key;
        const date = new Date(invoice.invoiceDate);

        switch (groupBy) {
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          default:
            key = invoice.invoiceDate;
        }

        if (!grouped[key]) {
          grouped[key] = {
            period: key,
            invoiceCount: 0,
            grossAmount: 0,
            discountAmount: 0,
            taxAmount: 0,
            netAmount: 0
          };
        }

        grouped[key].invoiceCount += 1;
        grouped[key].grossAmount += invoice.totals?.grossAmount || 0;
        grouped[key].discountAmount += invoice.totals?.discountAmount || 0;
        grouped[key].taxAmount += invoice.totals?.totalGstAmount || 0;
        grouped[key].netAmount += invoice.totals?.netAmount || 0;
      });

      return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    },

    getProductReport: (invoices) => {
      const { dateRange } = get();
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      const filtered = invoices.filter(i => {
        const date = new Date(i.invoiceDate);
        return date >= fromDate && date <= toDate;
      });

      const productStats = {};
      filtered.forEach(invoice => {
        invoice.lineItems?.forEach(item => {
          if (item.product) {
            const key = item.product.id;
            if (!productStats[key]) {
              productStats[key] = {
                product: item.product,
                totalQty: 0,
                totalGross: 0,
                totalDiscount: 0,
                totalTax: 0,
                totalNet: 0,
                invoiceCount: 0
              };
            }
            productStats[key].totalQty += item.quantity || 0;
            productStats[key].totalGross += item.grossAmount || 0;
            productStats[key].totalDiscount += item.discAmount || 0;
            productStats[key].totalTax += (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0);
            productStats[key].totalNet += item.netAmount || 0;
            productStats[key].invoiceCount += 1;
          }
        });
      });

      return Object.values(productStats).sort((a, b) => b.totalNet - a.totalNet);
    },

    getCustomerReport: (invoices, customers) => {
      const { dateRange } = get();
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      const filtered = invoices.filter(i => {
        const date = new Date(i.invoiceDate);
        return date >= fromDate && date <= toDate;
      });

      const customerStats = {};
      filtered.forEach(invoice => {
        if (invoice.party) {
          const key = invoice.party.id;
          if (!customerStats[key]) {
            const customer = customers.find(c => c.id === key) || invoice.party;
            customerStats[key] = {
              customer,
              invoiceCount: 0,
              totalAmount: 0,
              avgOrderValue: 0,
              lastInvoiceDate: null
            };
          }
          customerStats[key].invoiceCount += 1;
          customerStats[key].totalAmount += invoice.totals?.netAmount || 0;
          if (!customerStats[key].lastInvoiceDate || invoice.invoiceDate > customerStats[key].lastInvoiceDate) {
            customerStats[key].lastInvoiceDate = invoice.invoiceDate;
          }
        }
      });

      Object.values(customerStats).forEach(stat => {
        stat.avgOrderValue = stat.invoiceCount > 0
          ? stat.totalAmount / stat.invoiceCount
          : 0;
      });

      return Object.values(customerStats).sort((a, b) => b.totalAmount - a.totalAmount);
    },

    getGstReport: (invoices) => {
      const { dateRange } = get();
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      const filtered = invoices.filter(i => {
        const date = new Date(i.invoiceDate);
        return date >= fromDate && date <= toDate;
      });

      const gstSummary = {
        totalTaxable: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        totalGst: 0,
        byRate: {}
      };

      filtered.forEach(invoice => {
        invoice.lineItems?.forEach(item => {
          const rate = item.gstPercent || 0;
          if (!gstSummary.byRate[rate]) {
            gstSummary.byRate[rate] = {
              rate,
              taxable: 0,
              cgst: 0,
              sgst: 0,
              igst: 0,
              total: 0
            };
          }

          gstSummary.byRate[rate].taxable += item.taxableAmount || 0;
          gstSummary.byRate[rate].cgst += item.cgstAmount || 0;
          gstSummary.byRate[rate].sgst += item.sgstAmount || 0;
          gstSummary.byRate[rate].igst += item.igstAmount || 0;
          gstSummary.byRate[rate].total += (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0);

          gstSummary.totalTaxable += item.taxableAmount || 0;
          gstSummary.totalCgst += item.cgstAmount || 0;
          gstSummary.totalSgst += item.sgstAmount || 0;
          gstSummary.totalIgst += item.igstAmount || 0;
        });
      });

      gstSummary.totalGst = gstSummary.totalCgst + gstSummary.totalSgst + gstSummary.totalIgst;

      return gstSummary;
    },

    reset: () => set(initialState)
  }), {
    enableImmer: false
  })
);

export const reportsSelectors = {
  useDashboardData: () => useReportsStore(state => state.dashboardData),
  useDateRange: () => useReportsStore(state => state.dateRange),
  useIsLoading: () => useReportsStore(state => state.isLoading),
  useLastUpdated: () => useReportsStore(state => state.lastUpdated)
};

export default useReportsStore;
