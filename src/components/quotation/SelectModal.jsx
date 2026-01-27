import { useState, useEffect, useRef, useCallback } from 'react';

export const SelectModal = ({
  isOpen,
  onClose,
  onSelect,
  title,
  data = [],
  columns = [],
  searchPlaceholder = 'Search...',
  newButtonText = 'New Account'
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const filteredData = data.filter(item => {
    const searchLower = search.toLowerCase();
    return columns.some(col => {
      const value = item[col.key];
      return value && String(value).toLowerCase().includes(searchLower);
    });
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
    if (listRef.current && filteredData.length > 0) {
      const selectedRow = listRef.current.children[selectedIndex + 1];
      if (selectedRow) {
        selectedRow.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredData.length]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredData.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredData[selectedIndex]) {
        onSelect(filteredData[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [filteredData, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-[520px] max-h-[75vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500">
          <span className="text-sm font-semibold text-white tracking-wide">{title}</span>
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
            placeholder={searchPlaceholder}
            className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg bg-white
                     focus:bg-amber-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                     focus:outline-none transition-all duration-150 placeholder:text-slate-400"
          />
          <div className="mt-2 text-xs text-slate-400">
            {filteredData.length} items found
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto" ref={listRef}>
          {/* Header */}
          <div className="flex bg-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide sticky top-0 border-b border-slate-200">
            {columns.map((col, i) => (
              <div
                key={col.key}
                className="px-3 py-2.5 border-r border-slate-200 last:border-r-0"
                style={{ width: col.width || 'auto', flex: col.flex || 'none' }}
              >
                {col.header}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filteredData.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => {
                setSelectedIndex(index);
                onSelect(item);
                onClose();
              }}
              className={`
                flex text-sm cursor-pointer border-b border-slate-100 last:border-b-0 transition-all duration-100
                ${index === selectedIndex
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-700 hover:bg-blue-50'}
              `}
            >
              {columns.map((col, i) => (
                <div
                  key={col.key}
                  className={`px-3 py-2.5 border-r last:border-r-0 truncate
                    ${index === selectedIndex ? 'border-blue-400' : 'border-slate-100'}`}
                  style={{ width: col.width || 'auto', flex: col.flex || 'none' }}
                >
                  {item[col.key] || ''}
                </div>
              ))}
            </div>
          ))}

          {filteredData.length === 0 && (
            <div className="px-4 py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 font-medium">No results found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-400">
            Use <kbd className="kbd">↑↓</kbd> to navigate, <kbd className="kbd">Enter</kbd> to select
          </span>
          <button className="px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
            {newButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectModal;
