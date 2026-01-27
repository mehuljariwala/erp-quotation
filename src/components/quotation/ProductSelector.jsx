import { useState, useCallback, useRef, useEffect } from 'react';
import { Package, Image as ImageIcon } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import { formatCurrency } from '../../utils/formatters';

export const ProductSelector = ({ isOpen, onClose, onSelect, priceList = 'MRP' }) => {
  const { products } = useMasterStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const filteredProducts = products.filter(product => {
    const searchLower = search.toLowerCase();
    return (
      product.skuCode?.toLowerCase().includes(searchLower) ||
      product.name?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (listRef.current && filteredProducts.length > 0) {
      const selectedRow = listRef.current.children[selectedIndex + 1];
      if (selectedRow) {
        selectedRow.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredProducts.length]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[selectedIndex]) {
        onSelect(filteredProducts[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [filteredProducts, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  const columns = [
    { key: 'skuCode', header: 'SKU Code', width: '100px' },
    { key: 'name', header: 'Name', flex: 1 },
    { key: 'description', header: 'Desc', width: '150px' },
    { key: 'mrp', header: 'MRP', width: '80px', align: 'right' },
    { key: 'image', header: 'Image', width: '60px', align: 'center' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-[680px] max-h-[75vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-white/80" />
            <span className="text-sm font-semibold text-white tracking-wide">Select Item Master</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by SKU, name, description..."
            className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg bg-white
                     focus:bg-amber-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                     focus:outline-none transition-all duration-150 placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-400">{filteredProducts.length} items found</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              Price List: {priceList}
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto" ref={listRef}>
          {/* Header */}
          <div className="flex bg-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide sticky top-0 border-b border-slate-200">
            {columns.map((col) => (
              <div
                key={col.key}
                className="px-3 py-2.5 border-r border-slate-200 last:border-r-0"
                style={{
                  width: col.width || 'auto',
                  flex: col.flex || 'none',
                  textAlign: col.align || 'left'
                }}
              >
                {col.header}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filteredProducts.map((product, index) => (
            <div
              key={product.id || index}
              onClick={() => {
                setSelectedIndex(index);
                onSelect(product);
                onClose();
              }}
              className={`
                flex text-sm cursor-pointer border-b border-slate-100 last:border-b-0 transition-all duration-100
                ${index === selectedIndex
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-700 hover:bg-blue-50'}
              `}
            >
              <div
                className={`px-3 py-2.5 font-mono truncate border-r
                  ${index === selectedIndex ? 'border-blue-400' : 'border-slate-100'}`}
                style={{ width: '100px' }}
              >
                {product.skuCode || ''}
              </div>
              <div
                className={`px-3 py-2.5 truncate border-r font-medium
                  ${index === selectedIndex ? 'border-blue-400' : 'border-slate-100'}`}
                style={{ flex: 1 }}
              >
                {product.name || ''}
              </div>
              <div
                className={`px-3 py-2.5 truncate border-r text-xs
                  ${index === selectedIndex ? 'border-blue-400 text-blue-100' : 'border-slate-100 text-slate-500'}`}
                style={{ width: '150px' }}
              >
                {product.description || ''}
              </div>
              <div
                className={`px-3 py-2.5 font-mono text-right border-r
                  ${index === selectedIndex ? 'border-blue-400' : 'border-slate-100'}`}
                style={{ width: '80px' }}
              >
                {formatCurrency(product.prices?.[priceList] || product.prices?.MRP || 0, { showSymbol: false })}
              </div>
              <div
                className="px-3 py-2 flex items-center justify-center"
                style={{ width: '60px' }}
              >
                {product.image ? (
                  <img src={product.image} alt="" className="w-7 h-7 object-cover rounded-md shadow-sm" />
                ) : (
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center
                    ${index === selectedIndex ? 'bg-blue-400' : 'bg-slate-100'}`}>
                    <ImageIcon className={`w-4 h-4 ${index === selectedIndex ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="px-4 py-12 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">No products found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-400">
            Use <kbd className="kbd">↑↓</kbd> to navigate, <kbd className="kbd">Enter</kbd> to select
          </span>
          <button className="px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
