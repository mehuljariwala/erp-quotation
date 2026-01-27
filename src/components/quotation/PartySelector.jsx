import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, MapPin, Building2, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useMasterStore } from '../../stores/masterStore';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { formatPhone } from '../../utils/formatters';

export const PartySelector = ({ isOpen, onClose, onSelect }) => {
  const { parties } = useMasterStore();
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { query, setQuery, filteredItems, clearQuery } = useSearchFilter(
    parties,
    ['name', 'alias', 'phone', 'city', 'gstNumber'],
    { maxResults: 50 }
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHighlightedIndex(0);
      clearQuery();
    }
  }, [isOpen, clearQuery]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredItems]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback((party) => {
    onSelect(party);
    onClose();
    clearQuery();
  }, [onSelect, onClose, clearQuery]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [filteredItems, highlightedIndex, handleSelect, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Party"
      size="lg"
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, alias, phone, city, or GST..."
          className="w-full pl-10 pr-4 py-3 bg-surface-700 border border-surface-500 rounded-lg
                    text-text-primary placeholder:text-text-muted
                    focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30"
        />
      </div>

      <div className="text-xs text-text-muted mb-2 flex justify-between">
        <span>Showing {filteredItems.length} of {parties.length} parties</span>
        <span className="flex gap-2">
          <kbd className="kbd">↑↓</kbd> navigate
          <kbd className="kbd">↵</kbd> select
        </span>
      </div>

      <div
        ref={listRef}
        className="max-h-[400px] overflow-y-auto border border-surface-600 rounded-lg divide-y divide-surface-600"
      >
        {filteredItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-text-muted">
            No parties found matching "{query}"
          </div>
        ) : (
          filteredItems.map((party, index) => (
            <motion.div
              key={party.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleSelect(party)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-4 py-3 cursor-pointer transition-colors
                ${index === highlightedIndex
                  ? 'bg-accent-primary/15'
                  : 'hover:bg-surface-700'
                }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary truncate">
                      {party.name}
                    </span>
                    {party.alias && (
                      <span className="text-xs px-1.5 py-0.5 bg-surface-600 rounded text-text-muted">
                        {party.alias}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {formatPhone(party.phone)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {party.city}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted font-mono">{party.gstNumber}</p>
                  <p className="text-xs text-accent-primary mt-1">
                    Limit: ₹{(party.creditLimit / 100000).toFixed(1)}L
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <Button
          variant="ghost"
          icon={Plus}
          onClick={() => {
            console.log('Add new party');
          }}
        >
          Add New Party
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default PartySelector;
