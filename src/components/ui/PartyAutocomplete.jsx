import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Phone, MapPin, X, Check, Loader2, Users } from 'lucide-react';
import { useQuotationStore } from '../../stores/quotationStore';
import { formatPhone } from '../../utils/formatters';

export const PartyAutocomplete = forwardRef(({
  value,
  onChange,
  placeholder = "Search parties...",
  disabled = false,
  onNext,
  onPrev,
  searchType = 'Account'
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const pendingFocusRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const lastSearchRef = useRef({ query: null, isOpen: false });
  const hasUserInteracted = useRef(false);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      triggerRef.current?.focus();
    }
  }));

  const { searchParties, searchReferences } = useQuotationStore();

  const performSearch = useCallback(async (searchQuery) => {
    setIsLoading(true);
    try {
      const searchFn = searchType === 'Refrence' ? searchReferences : searchParties;
      const data = await searchFn(searchQuery);
      setResults(data);
      setHighlightedIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchType, searchParties, searchReferences]);

  useEffect(() => {
    if (!isOpen) {
      lastSearchRef.current = { query: null, isOpen: false };
      return;
    }

    if (lastSearchRef.current.query === query && lastSearchRef.current.isOpen === isOpen) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      lastSearchRef.current = { query, isOpen };
      performSearch(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, isOpen, performSearch]);

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
      performSearch('');
    }
  }, [isOpen, performSearch]);

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
  }, [disabled, isOpen]);

  const closeModal = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

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
    setQuery('');

    if (onNext) {
      pendingFocusRef.current = onNext;
    } else {
      pendingFocusRef.current = () => triggerRef.current?.focus();
    }

    setIsOpen(false);
  }, [onChange, onNext]);

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
        setHighlightedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          closeAndFocusNext(results[highlightedIndex]);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (results[highlightedIndex]) {
          closeAndFocusNext(results[highlightedIndex]);
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
  }, [results, highlightedIndex, closeAndFocusNext, closeModal, onNext]);

  const modalTitle = searchType === 'Refrence' ? 'Select Reference' : 'Select Party';

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
            <span className="font-medium text-slate-800 truncate">{value.name}</span>
            {value.alias && (
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                {value.alias}
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

          <div className="relative bg-white rounded-xl shadow-2xl w-[580px] max-h-[75vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Title Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/80" />
                <span className="text-sm font-semibold text-white tracking-wide">{modalTitle}</span>
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
                  placeholder="Search by name, phone, city..."
                  className="w-full h-10 pl-10 pr-4 text-sm border border-slate-200 rounded-lg bg-white
                           focus:bg-amber-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                           focus:outline-none transition-all duration-150 placeholder:text-slate-400"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-400">
                  {isLoading ? 'Searching...' : `${results.length} items found`}
                </span>
              </div>
            </div>

            {/* Results List */}
            <div ref={listRef} className="flex-1 overflow-y-auto max-h-[400px]">
              {isLoading && results.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                  <p className="text-sm text-slate-500">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    No {searchType === 'Refrence' ? 'references' : 'parties'} found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                results.map((party, index) => (
                  <div
                    key={party.id || index}
                    onClick={() => closeAndFocusNext(party)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 transition-all duration-100
                      ${index === highlightedIndex
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-700 hover:bg-blue-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                        ${index === highlightedIndex ? 'bg-blue-400 text-white' : 'bg-slate-100 text-slate-600'}
                      `}>
                        {party.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{party.name}</span>
                          {party.alias && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              index === highlightedIndex ? 'bg-blue-400 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {party.alias}
                            </span>
                          )}
                          {value?.id === party.id && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className={`flex items-center gap-3 text-[11px] mt-0.5 ${
                          index === highlightedIndex ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {party.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {formatPhone(party.phone)}
                            </span>
                          )}
                          {party.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {party.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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

PartyAutocomplete.displayName = 'PartyAutocomplete';
export default PartyAutocomplete;
