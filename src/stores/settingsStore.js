import { create } from 'zustand';
import { createStore } from './middleware';

const initialState = {
  general: {
    companyName: 'My Company',
    companyLogo: null,
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    fiscalYearStart: '04-01',
    defaultGstPercent: 18,
    decimalPlaces: 2
  },
  quotation: {
    prefix: 'QT',
    startNumber: 1,
    autoSave: true,
    autoSaveInterval: 30000,
    defaultPriceList: 'MRP',
    defaultValidityDays: 30,
    showProductImages: true,
    enableDiscount: true,
    maxDiscountPercent: 50,
    requireApprovalAbove: 100000
  },
  invoice: {
    prefix: 'INV',
    startNumber: 1,
    defaultPaymentTerms: 30,
    enablePartialPayment: true,
    autoGenerateFromQuotation: true
  },
  inventory: {
    lowStockThreshold: 10,
    enableNegativeStock: false,
    defaultWarehouse: 'main',
    trackBatches: false,
    trackSerialNumbers: false
  },
  printing: {
    paperSize: 'A4',
    showLogo: true,
    showTerms: true,
    showBankDetails: true,
    footerText: 'Thank you for your business!',
    copies: 1
  },
  notifications: {
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    lowStockAlerts: true,
    paymentReminders: true,
    quotationExpiry: true
  },
  display: {
    theme: 'light',
    sidebarCollapsed: false,
    tableRowsPerPage: 25,
    enableAnimations: true,
    compactMode: false
  }
};

export const useSettingsStore = create(
  createStore('settings', (set, get) => ({
    ...initialState,

    updateGeneralSettings: (updates) => {
      set(state => ({
        general: { ...state.general, ...updates }
      }));
    },

    updateQuotationSettings: (updates) => {
      set(state => ({
        quotation: { ...state.quotation, ...updates }
      }));
    },

    updateInvoiceSettings: (updates) => {
      set(state => ({
        invoice: { ...state.invoice, ...updates }
      }));
    },

    updateInventorySettings: (updates) => {
      set(state => ({
        inventory: { ...state.inventory, ...updates }
      }));
    },

    updatePrintingSettings: (updates) => {
      set(state => ({
        printing: { ...state.printing, ...updates }
      }));
    },

    updateNotificationSettings: (updates) => {
      set(state => ({
        notifications: { ...state.notifications, ...updates }
      }));
    },

    updateDisplaySettings: (updates) => {
      set(state => ({
        display: { ...state.display, ...updates }
      }));
    },

    setTheme: (theme) => {
      set(state => ({
        display: { ...state.display, theme }
      }));
    },

    toggleCompactMode: () => {
      set(state => ({
        display: { ...state.display, compactMode: !state.display.compactMode }
      }));
    },

    getCurrencyFormatted: (amount) => {
      const { currencySymbol, decimalPlaces } = get().general;
      return `${currencySymbol}${amount.toFixed(decimalPlaces)}`;
    },

    getDateFormatted: (date) => {
      const { dateFormat } = get().general;
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      return dateFormat
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year);
    },

    exportSettings: () => {
      return JSON.stringify(get(), null, 2);
    },

    importSettings: (settingsJson) => {
      try {
        const settings = JSON.parse(settingsJson);
        set(settings);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    reset: () => set(initialState),

    resetSection: (section) => {
      if (initialState[section]) {
        set({ [section]: initialState[section] });
      }
    }
  }), {
    persist: true
  })
);

export const settingsSelectors = {
  useGeneralSettings: () => useSettingsStore(state => state.general),
  useQuotationSettings: () => useSettingsStore(state => state.quotation),
  useInvoiceSettings: () => useSettingsStore(state => state.invoice),
  useInventorySettings: () => useSettingsStore(state => state.inventory),
  usePrintingSettings: () => useSettingsStore(state => state.printing),
  useNotificationSettings: () => useSettingsStore(state => state.notifications),
  useDisplaySettings: () => useSettingsStore(state => state.display),
  useTheme: () => useSettingsStore(state => state.display.theme),
  useCurrency: () => useSettingsStore(state => ({
    currency: state.general.currency,
    symbol: state.general.currencySymbol
  }))
};

export default useSettingsStore;
