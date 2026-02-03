import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Check, Phone, MapPin, Globe, Tag, User } from 'lucide-react';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { formatPhone } from '../../utils/formatters';

const modalConfig = {
  salesman: {
    title: 'Select Salesman',
    icon: User,
    color: 'violet',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-violet-500'
  },
  priceList: {
    title: 'Select Price List',
    icon: Tag,
    color: 'emerald',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-emerald-500'
  }
};

export const SmartAutocomplete = forwardRef(({
  value,
  onChange,
  options = [],
  searchFields = ['name'],
  type = 'salesman',
  placeholder = "Search...",
  entityName = "items",
  disabled = false,
  displayField = 'name',
  minWidth = 350,
  onNext,
  onPrev
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const pendingFocusRef = useRef(null);
  const hasUserInteracted = useRef(false);

  const { query, setQuery, filteredItems, clearQuery } = useSearchFilter(
    options, searchFields, { maxResults: 50, debounceMs: 50 }
  );

  const config = modalConfig[type] || modalConfig.salesman;
  const IconComponent = config.icon;

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      triggerRef.current?.focus();
    }
  }));

  useEffect(() => {
    if (pendingFocusRef.current && !isOpen) {
      const focusFn = pendingFocusRef.current;
      pendingFocusRef.current = null;
      requestAnimationFrame(() => {
        focusFn();
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredItems]);

  useEffect(() => {
    if (isOpen && listRef.current?.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const openModal = useCallback(() => {
    if (disabled || isOpen) return;
    setIsOpen(true);
    setQuery('');
    setHighlightedIndex(0);
  }, [disabled, isOpen, setQuery]);

  const closeModal = useCallback(() => {
    clearQuery();
    setIsOpen(false);
  }, [clearQuery]);

  const handleFocus = useCallback(() => {
    if (!hasUserInteracted.current) return;
    openModal();
  }, [openModal]);

  const handleClick = useCallback(() => {
    hasUserInteracted.current = true;
    openModal();
  }, [openModal]);

  const closeAndFocusNext = useCallback((selectedItem) => {
    onChange(selectedItem);
    clearQuery();

    if (onNext) {
      pendingFocusRef.current = onNext;
    } else {
      pendingFocusRef.current = () => triggerRef.current?.focus();
    }

    setIsOpen(false);
  }, [onChange, clearQuery, onNext]);

  const handleTriggerKeyDown = useCallback((e) => {
    hasUserInteracted.current = true;
    switch (e.key) {
      case 'Tab':
        if (e.shiftKey) {
          if (onPrev) {
            e.preventDefault();
            onPrev();
          }
        } else {
          if (onNext) {
            e.preventDefault();
            onNext();
          }
        }
        break;
      case 'Enter':
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        openModal();
        break;
    }
  }, [openModal, onNext, onPrev]);

  const handleInputKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, filteredItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          closeAndFocusNext(filteredItems[highlightedIndex]);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          closeAndFocusNext(filteredItems[highlightedIndex]);
        } else if (onNext) {
          closeModal();
          requestAnimationFrame(() => onNext());
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeModal();
        pendingFocusRef.current = () => triggerRef.current?.focus();
        break;
    }
  }, [filteredItems, highlightedIndex, closeAndFocusNext, closeModal, onNext]);

  const displayValue = value ? (value[displayField] || value.name || '') : '';

  const renderSalesmanItem = (item, index) => (
    <div className="flex items-center gap-3">
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${index === highlightedIndex ? 'bg-violet-400 text-white' : 'bg-slate-100 text-slate-600'}
      `}>
        <User className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{item.name}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            index === highlightedIndex ? 'bg-violet-400 text-white' : 'bg-violet-100 text-violet-600'
          }`}>
            {item.code}
          </span>
          {value?.id === item.id && <Check className="w-4 h-4 text-emerald-400" />}
        </div>
        <div className={`flex items-center gap-3 text-[11px] mt-0.5 ${
          index === highlightedIndex ? 'text-violet-100' : 'text-slate-500'
        }`}>
          {item.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {formatPhone(item.phone)}
            </span>
          )}
          {item.territory && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {item.territory}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderPriceListItem = (item, index) => (
    <div className="flex items-center gap-3">
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${index === highlightedIndex ? 'bg-emerald-400 text-white' : 'bg-slate-100 text-slate-600'}
      `}>
        <Tag className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{item.name}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            index === highlightedIndex ? 'bg-emerald-400 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {item.code}
          </span>
          {value?.id === item.id && <Check className="w-4 h-4 text-emerald-400" />}
        </div>
        <div className={`text-[11px] mt-0.5 truncate ${
          index === highlightedIndex ? 'text-emerald-100' : 'text-slate-500'
        }`}>
          {item.description}
        </div>
      </div>
      <div className={`text-sm font-bold font-mono px-2 py-1 rounded ${
        index === highlightedIndex
          ? 'bg-emerald-400 text-white'
          : item.discountPercent > 0
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
      }`}>
        {item.discountPercent > 0 ? `-${item.discountPercent}%` : 'MRP'}
      </div>
    </div>
  );

  const renderItem = (item, index) => {
    if (type === 'priceList') {
      return renderPriceListItem(item, index);
    }
    return renderSalesmanItem(item, index);
  };

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleTriggerKeyDown}
        className={`
          w-full h-9 px-3 bg-white border rounded-md cursor-pointer
          flex items-center gap-2 text-[13px] outline-none
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
          ${isOpen
            ? 'border-blue-500 ring-2 ring-blue-100 bg-yellow-50'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-yellow-50'
          }
        `}
      >
        {value ? (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="font-medium text-slate-800 truncate">{displayValue}</span>
            {value.code && (
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">
                {value.code}
              </span>
            )}
          </div>
        ) : (
          <span className="flex-1 text-slate-400">{placeholder}</span>
        )}
        {value && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="p-0.5 hover:bg-slate-100 rounded"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative bg-white rounded-xl shadow-2xl w-[520px] max-h-[75vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Title Bar */}
            <div className={`flex items-center justify-between px-5 py-3.5 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`}>
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-white/80" />
                <span className="text-sm font-semibold text-white tracking-wide">{config.title}</span>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={`Search ${entityName}...`}
                  className="w-full h-10 pl-10 pr-4 text-sm border border-slate-200 rounded-lg bg-white
                           focus:bg-amber-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                           focus:outline-none transition-all duration-150 placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-400">{filteredItems.length} of {options.length} items</span>
              </div>
            </div>

            {/* Results List */}
            <div ref={listRef} className="flex-1 overflow-y-auto max-h-[400px]">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No {entityName} found</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => closeAndFocusNext(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 transition-all duration-100
                      ${index === highlightedIndex
                        ? type === 'priceList'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-violet-500 text-white'
                        : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    {renderItem(item, index)}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200">
              <span className="text-xs text-slate-400">
                Use <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono">↑↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono">Enter</kbd> to select
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

SmartAutocomplete.displayName = 'SmartAutocomplete';
export default SmartAutocomplete;
