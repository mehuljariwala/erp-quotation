import React from 'react';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const ProductMaster = () => {
  const { products } = useMasterStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Product Master</h2>
        <Button variant="primary" icon={Plus}>Add Product</Button>
      </div>

      <div className="bg-surface-800 rounded-xl border border-surface-600 overflow-hidden">
        <div className="p-4 border-b border-surface-600">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-surface-700 border border-surface-500 rounded-lg
                        text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-surface-700">
            <tr className="text-xs text-text-secondary uppercase">
              <th className="px-4 py-3 text-left">SKU Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">MRP</th>
              <th className="px-4 py-3 text-right">Wholesale</th>
              <th className="px-4 py-3 text-right">Dealer</th>
              <th className="px-4 py-3 text-center">GST%</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700">
            {products.slice(0, 15).map(product => (
              <tr key={product.id} className="hover:bg-surface-700/50">
                <td className="px-4 py-3 font-mono text-accent-secondary">{product.skuCode}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-text-primary">{product.name}</p>
                    <p className="text-xs text-text-muted truncate max-w-xs">{product.description}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary text-sm">{product.category}</td>
                <td className="px-4 py-3 text-right font-mono text-text-primary">
                  {formatCurrency(product.prices.MRP, { showSymbol: false })}
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">
                  {formatCurrency(product.prices.Wholesale, { showSymbol: false })}
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">
                  {formatCurrency(product.prices.Dealer, { showSymbol: false })}
                </td>
                <td className="px-4 py-3 text-center text-text-secondary">{product.gstPercent}%</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">
                    <button className="p-1.5 rounded text-text-muted hover:text-accent-primary hover:bg-accent-primary/10">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded text-text-muted hover:text-accent-danger hover:bg-accent-danger/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductMaster;
