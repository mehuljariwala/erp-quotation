import { create } from 'zustand';
import { createStore } from './middleware';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  stockItems: [],
  warehouses: [
    { id: 'main', name: 'Main Warehouse', location: 'HQ', isDefault: true },
    { id: 'branch1', name: 'Branch Warehouse', location: 'Branch 1', isDefault: false }
  ],
  stockMovements: [],
  lowStockItems: [],
  isLoading: false,
  lastSyncedAt: null
};

export const useInventoryStore = create(
  createStore('inventory', (set, get) => ({
    ...initialState,

    setStockItems: (items) => {
      set({ stockItems: items });
      get().updateLowStockItems();
    },

    getStock: (productId, warehouseId = null) => {
      const items = get().stockItems.filter(item =>
        item.productId === productId &&
        (warehouseId ? item.warehouseId === warehouseId : true)
      );
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    getStockByWarehouse: (productId) => {
      const items = get().stockItems.filter(item => item.productId === productId);
      return items.reduce((acc, item) => {
        acc[item.warehouseId] = (acc[item.warehouseId] || 0) + item.quantity;
        return acc;
      }, {});
    },

    adjustStock: (productId, warehouseId, quantity, reason, reference = null) => {
      const movement = {
        id: uuidv4(),
        productId,
        warehouseId,
        quantity,
        type: quantity > 0 ? 'IN' : 'OUT',
        reason,
        reference,
        timestamp: new Date().toISOString(),
        userId: null // TODO: Get from authStore
      };

      set(state => {
        const existingIndex = state.stockItems.findIndex(
          item => item.productId === productId && item.warehouseId === warehouseId
        );

        let stockItems;
        if (existingIndex >= 0) {
          stockItems = state.stockItems.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity, lastUpdated: movement.timestamp }
              : item
          );
        } else {
          stockItems = [...state.stockItems, {
            id: uuidv4(),
            productId,
            warehouseId,
            quantity,
            lastUpdated: movement.timestamp
          }];
        }

        return {
          stockItems,
          stockMovements: [movement, ...state.stockMovements]
        };
      });

      get().updateLowStockItems();
    },

    transferStock: (productId, fromWarehouseId, toWarehouseId, quantity, reference = null) => {
      const { getStock, adjustStock } = get();
      const currentStock = getStock(productId, fromWarehouseId);

      if (currentStock < quantity) {
        return { success: false, error: 'Insufficient stock' };
      }

      adjustStock(productId, fromWarehouseId, -quantity, 'TRANSFER_OUT', reference);
      adjustStock(productId, toWarehouseId, quantity, 'TRANSFER_IN', reference);

      return { success: true };
    },

    updateLowStockItems: () => {
      const threshold = 10; // TODO: Get from settingsStore
      const lowStock = get().stockItems.filter(item => item.quantity <= threshold);
      set({ lowStockItems: lowStock });
    },

    getMovementHistory: (productId, limit = 50) => {
      return get().stockMovements
        .filter(m => m.productId === productId)
        .slice(0, limit);
    },

    addWarehouse: (warehouse) => {
      const newWarehouse = {
        id: uuidv4(),
        ...warehouse,
        isDefault: false
      };
      set(state => ({
        warehouses: [...state.warehouses, newWarehouse]
      }));
      return newWarehouse.id;
    },

    updateWarehouse: (id, updates) => {
      set(state => ({
        warehouses: state.warehouses.map(w =>
          w.id === id ? { ...w, ...updates } : w
        )
      }));
    },

    setDefaultWarehouse: (id) => {
      set(state => ({
        warehouses: state.warehouses.map(w => ({
          ...w,
          isDefault: w.id === id
        }))
      }));
    },

    syncStock: async () => {
      set({ isLoading: true });
      try {
        // TODO: Implement API sync
        set({ lastSyncedAt: new Date().toISOString(), isLoading: false });
        return { success: true };
      } catch (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    },

    reset: () => set(initialState)
  }), {
    persist: true,
    persistOptions: {
      partialize: (state) => ({
        stockItems: state.stockItems,
        warehouses: state.warehouses,
        stockMovements: state.stockMovements.slice(0, 1000) // Keep last 1000 movements
      })
    }
  })
);

export const inventorySelectors = {
  useStockItems: () => useInventoryStore(state => state.stockItems),
  useWarehouses: () => useInventoryStore(state => state.warehouses),
  useLowStockItems: () => useInventoryStore(state => state.lowStockItems),
  useIsLoading: () => useInventoryStore(state => state.isLoading)
};

export default useInventoryStore;
