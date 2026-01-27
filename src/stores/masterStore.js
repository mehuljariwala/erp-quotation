import { create } from 'zustand';
import { parties } from '../data/parties';
import { products } from '../data/products';
import { salesmen } from '../data/salesmen';
import { priceLists } from '../data/priceLists';
import { areas } from '../data/areas';

export const useMasterStore = create((set, get) => ({
  // Master data
  parties,
  products,
  salesmen,
  priceLists,
  areas,

  // Search/filter helpers
  searchParties: (query) => {
    if (!query) return get().parties;
    const lowerQuery = query.toLowerCase();
    return get().parties.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.alias?.toLowerCase().includes(lowerQuery) ||
      p.phone?.includes(query) ||
      p.city?.toLowerCase().includes(lowerQuery)
    );
  },

  searchProducts: (query) => {
    if (!query) return get().products;
    const lowerQuery = query.toLowerCase();
    return get().products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.skuCode.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.category?.toLowerCase().includes(lowerQuery)
    );
  },

  searchSalesmen: (query) => {
    if (!query) return get().salesmen;
    const lowerQuery = query.toLowerCase();
    return get().salesmen.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.code.toLowerCase().includes(lowerQuery)
    );
  },

  // Getters
  getPartyById: (id) => get().parties.find(p => p.id === id),
  getProductById: (id) => get().products.find(p => p.id === id),
  getProductBySku: (sku) => get().products.find(p => p.skuCode === sku),
  getSalesmanById: (id) => get().salesmen.find(s => s.id === id),
  getPriceListByName: (name) => get().priceLists.find(pl => pl.name === name),
  getAreaById: (id) => get().areas.find(a => a.id === id)
}));

export default useMasterStore;
