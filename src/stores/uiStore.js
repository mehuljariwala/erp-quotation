import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Modal states
  isPartyModalOpen: false,
  isProductModalOpen: false,
  isSalesmanModalOpen: false,
  isDiscountModalOpen: false,
  isConfirmModalOpen: false,
  confirmModalConfig: null,

  // Active context
  activeProductRowId: null,
  activeModule: 'quotation',

  // Focus tracking
  focusedField: null,
  focusedGridCell: null, // { rowId, columnId }

  // Notifications
  notifications: [],

  // Sidebar state
  isSidebarCollapsed: false,

  // Search states
  globalSearchQuery: '',

  // Theme
  theme: 'dark',

  // Modal actions
  openPartyModal: () => set({ isPartyModalOpen: true }),
  closePartyModal: () => set({ isPartyModalOpen: false }),

  openProductModal: (rowId) => set({
    isProductModalOpen: true,
    activeProductRowId: rowId
  }),
  closeProductModal: () => set({
    isProductModalOpen: false,
    activeProductRowId: null
  }),

  openSalesmanModal: () => set({ isSalesmanModalOpen: true }),
  closeSalesmanModal: () => set({ isSalesmanModalOpen: false }),

  openDiscountModal: () => set({ isDiscountModalOpen: true }),
  closeDiscountModal: () => set({ isDiscountModalOpen: false }),

  openConfirmModal: (config) => set({
    isConfirmModalOpen: true,
    confirmModalConfig: config
  }),
  closeConfirmModal: () => set({
    isConfirmModalOpen: false,
    confirmModalConfig: null
  }),

  // Focus actions
  setFocusedField: (field) => set({ focusedField: field }),
  setFocusedGridCell: (cell) => set({ focusedGridCell: cell }),
  clearFocus: () => set({ focusedField: null, focusedGridCell: null }),

  // Module navigation
  setActiveModule: (module) => set({ activeModule: module }),

  // Sidebar actions
  toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  // Search actions
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

  // Notification actions
  showNotification: (type, message, duration = 3000) => {
    const id = Date.now();
    set(state => ({
      notifications: [...state.notifications, { id, type, message }]
    }));

    if (duration > 0) {
      setTimeout(() => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }, duration);
    }

    return id;
  },

  dismissNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  // Shortcut helpers
  showSuccess: (message) => get().showNotification('success', message),
  showError: (message) => get().showNotification('error', message, 5000),
  showWarning: (message) => get().showNotification('warning', message, 4000),
  showInfo: (message) => get().showNotification('info', message)
}));

export default useUIStore;
