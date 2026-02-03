import { useState, useCallback, useRef, useEffect } from 'react';
import { Package, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/formatters';

const API_BASE_URL = 'https://apiord.maitriceramic.com';

export const ProductSelector = ({ isOpen, onClose, onSelect, priceList = 'MRP', priceId = 0 }) => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const priceIdRef = useRef(priceId);
  const abortControllerRef = useRef(null);

  priceIdRef.current = priceId;

  const fetchProducts = useCallback(async (searchQuery, signal) => {
    setIsLoading(true);

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/api/lookUp/product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skuCode: searchQuery || '',
          priceId: priceIdRef.current
        }),
        signal
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        setProducts([]);
      }
      setSelectedIndex(0);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Product search failed:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setProducts([]);
      setTimeout(() => searchRef.current?.focus(), 50);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      fetchProducts('', abortControllerRef.current.signal);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [isOpen, fetchProducts]);

  useEffect(() => {
    if (!isOpen || search === '') return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      fetchProducts(search, abortControllerRef.current.signal);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, isOpen, fetchProducts]);

  useEffect(() => {
    if (listRef.current && products.length > 0) {
      const selectedRow = listRef.current.children[selectedIndex + 1];
      if (selectedRow) {
        selectedRow.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, products.length]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, products.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (products[selectedIndex]) {
        onSelect(products[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [products, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  const columns = [
    { key: 'image', header: 'Image', width: '80px', align: 'center' },
    { key: 'skuCode', header: 'SKU Code', width: '130px' },
    { key: 'name', header: 'Product Name', flex: 1 },
    { key: 'description', header: 'Description', width: '200px' },
    { key: 'mrp', header: 'MRP', width: '100px', align: 'right' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-white/90" />
            <span className="text-base font-semibold text-white tracking-wide">Select Item Master</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-150"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            placeholder="Search by SKU code, product name, or description..."
            className="w-full h-12 px-4 text-base border border-slate-200 rounded-lg bg-white
                     focus:bg-amber-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                     focus:outline-none transition-all duration-150 placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-slate-500 font-medium">
              {isLoading ? 'Searching...' : `${products.length} products found`}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">
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
                className="px-3 py-3 border-r border-slate-200 last:border-r-0"
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

          {/* Loading State */}
          {isLoading && products.length === 0 && (
            <div className="px-4 py-16 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-4 text-blue-500 animate-spin" />
              <p className="text-base text-slate-500 font-medium">Loading products...</p>
            </div>
          )}

          {/* Rows */}
          {products.map((product, index) => (
            <div
              key={product.id || index}
              onClick={() => {
                setSelectedIndex(index);
                onSelect(product);
                onClose();
              }}
              className={`
                flex items-center cursor-pointer border-b border-slate-100 last:border-b-0 transition-all duration-100
                ${index === selectedIndex
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-700 hover:bg-blue-50'}
              `}
              style={{ minHeight: '72px' }}
            >
              {/* Image */}
              <div
                className="px-3 py-2 flex items-center justify-center"
                style={{ width: '80px' }}
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg shadow-sm border border-slate-200" />
                ) : (
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center
                    ${index === selectedIndex ? 'bg-blue-400' : 'bg-slate-100'}`}>
                    <ImageIcon className={`w-6 h-6 ${index === selectedIndex ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                )}
              </div>
              {/* SKU Code */}
              <div
                className={`px-3 py-3 font-mono text-sm truncate border-r
                  ${index === selectedIndex ? 'border-blue-400 font-semibold' : 'border-slate-100 text-slate-600'}`}
                style={{ width: '130px' }}
              >
                {product.skuCode || ''}
              </div>
              {/* Name */}
              <div
                className={`px-3 py-3 truncate border-r font-semibold text-sm
                  ${index === selectedIndex ? 'border-blue-400' : 'border-slate-100'}`}
                style={{ flex: 1 }}
              >
                {product.name || ''}
              </div>
              {/* Description */}
              <div
                className={`px-3 py-3 truncate border-r text-sm
                  ${index === selectedIndex ? 'border-blue-400 text-blue-100' : 'border-slate-100 text-slate-500'}`}
                style={{ width: '200px' }}
              >
                {product.remark1 || product.description || ''}
              </div>
              {/* MRP */}
              <div
                className={`px-4 py-3 font-mono text-right font-semibold text-sm
                  ${index === selectedIndex ? '' : 'text-slate-700'}`}
                style={{ width: '100px' }}
              >
                ₹{formatCurrency(product.mrp || 0, { showSymbol: false })}
              </div>
            </div>
          ))}

          {!isLoading && products.length === 0 && (
            <div className="px-4 py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-base text-slate-500 font-medium">No products found</p>
              <p className="text-sm text-slate-400 mt-2">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-sm text-slate-500">
            Use <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">↑↓</kbd> to navigate, <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">Enter</kbd> to select, <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
