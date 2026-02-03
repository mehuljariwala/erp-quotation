// Core stores
export { useQuotationStore } from './quotationStore';
export { useUIStore } from './uiStore';
export { useMasterStore } from './masterStore';

// Extended stores
export { useAuthStore, authSelectors } from './authStore';
export { useSettingsStore, settingsSelectors } from './settingsStore';
export { useInventoryStore, inventorySelectors } from './inventoryStore';
export { useInvoiceStore, invoiceSelectors } from './invoiceStore';
export { useCustomerStore, customerSelectors } from './customerStore';
export { useReportsStore, reportsSelectors } from './reportsStore';

// Utilities
export {
  createStore,
  createPersistConfig,
  createSelectors,
  resetAllStores
} from './middleware';

// Reset all stores (useful for logout)
import { useAuthStore } from './authStore';
import { useSettingsStore } from './settingsStore';
import { useInventoryStore } from './inventoryStore';
import { useInvoiceStore } from './invoiceStore';
import { useCustomerStore } from './customerStore';
import { useReportsStore } from './reportsStore';

export const resetApplication = () => {
  useAuthStore.getState().reset();
  useInventoryStore.getState().reset();
  useInvoiceStore.getState().reset();
  useCustomerStore.getState().reset();
  useReportsStore.getState().reset();
};
