import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { useSearchFilter } from '../../hooks/useSearchFilter';

export const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Search...',
  displayField = 'name',
  searchFields = ['name'],
  disabled = false,
  autoFocus = false,
  tabIndex = 0,
  renderOption,
  renderSelected,
  openModalOnEmpty = false,
  onOpenModal,
  error,
  className = '',
  dropdownClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const { query, setQuery, filteredItems, clearQuery } = useSearchFilter(
    options,
    searchFields,
    { maxResults: 100, debounceMs: 50 }
  );

  const displayValue = useMemo(() => {
    if (!value) return '';
    if (renderSelected) return renderSelected(value);
    return value[displayField] || '';
  }, [value, displayField, renderSelected]);

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 300;

    setDropdownPosition({
      top: spaceBelow > dropdownHeight || spaceBelow > spaceAbove
        ? rect.bottom + 4
        : rect.top - dropdownHeight - 4,
      left: rect.left,
      width: rect.width
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        clearQuery();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearQuery]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredItems]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [disabled, setQuery]);

  const handleSelect = useCallback((item) => {
    onChange(item);
    setIsOpen(false);
    clearQuery();
  }, [onChange, clearQuery]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          handleOpen();
        } else {
          setHighlightedIndex(prev =>
            prev < filteredItems.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        } else if (!isOpen && openModalOnEmpty && !value) {
          onOpenModal?.();
        } else if (!isOpen) {
          handleOpen();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        clearQuery();
        break;
      case 'Tab':
        if (isOpen) {
          if (filteredItems[highlightedIndex]) {
            handleSelect(filteredItems[highlightedIndex]);
          }
          setIsOpen(false);
          clearQuery();
        }
        break;
    }
  }, [isOpen, filteredItems, highlightedIndex, handleOpen, handleSelect, clearQuery, openModalOnEmpty, onOpenModal, value]);

  const defaultRenderOption = useCallback((item, isHighlighted, isSelected) => (
    <div className={`
      px-3 py-2.5 cursor-pointer flex items-center justify-between
      transition-colors duration-75
      ${isHighlighted ? 'bg-accent-primary/20 text-text-primary' : 'text-text-secondary'}
      ${isSelected ? 'bg-accent-primary/10' : ''}
    `}>
      <span className="truncate">{item[displayField]}</span>
      {isSelected && <Check className="w-4 h-4 text-accent-primary flex-shrink-0" />}
    </div>
  ), [displayField]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">
          {label}
        </label>
      )}

      <div
        tabIndex={disabled ? -1 : tabIndex}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        className={`
          w-full px-3 py-2 bg-surface-700 border rounded-lg cursor-pointer
          flex items-center justify-between gap-2
          transition-all duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOpen
            ? 'border-accent-primary ring-1 ring-accent-primary/30'
            : error
              ? 'border-accent-danger'
              : 'border-surface-500 hover:border-surface-400'
          }
        `}
      >
        <span className={`truncate ${value ? 'text-text-primary' : 'text-text-muted'}`}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1.5">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="p-0.5 rounded hover:bg-surface-600 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <span className="text-xs text-accent-danger mt-1">{error}</span>}

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 9999
              }}
              className={`bg-surface-700 border border-surface-500 rounded-xl shadow-2xl overflow-hidden ${dropdownClassName}`}
            >
              <div className="p-2 border-b border-surface-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 bg-surface-800 border border-surface-600 rounded-lg
                              text-text-primary placeholder:text-text-muted text-sm
                              focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div ref={listRef} className="max-h-64 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="px-3 py-6 text-center text-text-muted text-sm">
                    No results found
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {renderOption
                        ? renderOption(item, index === highlightedIndex, value?.id === item.id)
                        : defaultRenderOption(item, index === highlightedIndex, value?.id === item.id)
                      }
                    </div>
                  ))
                )}
              </div>

              <div className="px-3 py-2 border-t border-surface-600 text-xs text-text-muted flex justify-between">
                <span>{filteredItems.length} of {options.length} items</span>
                <span className="flex gap-2">
                  <kbd className="kbd">↑↓</kbd> navigate
                  <kbd className="kbd">↵</kbd> select
                  <kbd className="kbd">esc</kbd> close
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default SearchableDropdown;
