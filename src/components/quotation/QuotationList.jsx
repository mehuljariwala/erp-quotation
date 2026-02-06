import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Edit2, Trash2, Copy, RefreshCw,
  FileText, ArrowUpDown, Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CenterSearchModal } from '../ui/CenterSearchModal';
import { useQuotationStore } from '../../stores/quotationStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const QuotationList = ({ onEditQuotation }) => {
  const {
    quotations,
    loadQuotation,
    deleteQuotation,
    duplicateQuotation,
    newQuotation,
    fetchQuotations,
    isLoading
  } = useQuotationStore();
  const { showSuccess, showError } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [sortField, setSortField] = useState('vchDate');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleRefresh = async () => {
    const result = await fetchQuotations();
    if (result.success) {
      showSuccess('Quotations refreshed');
    } else {
      showError(result.error || 'Failed to fetch quotations');
    }
  };

  const filteredQuotations = useMemo(() => {
    let filtered = [...quotations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.party?.name?.toLowerCase().includes(query) ||
        q.vchNo?.toString().includes(query) ||
        q.remark?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'party') {
        aVal = a.party?.name || '';
        bVal = b.party?.name || '';
      } else if (sortField === 'netAmount') {
        aVal = a.totals?.netAmount || 0;
        bVal = b.totals?.netAmount || 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [quotations, searchQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleEdit = async (id) => {
    const result = await loadQuotation(id);
    if (result.success) {
      onEditQuotation?.();
    } else {
      showError(result.error || 'Failed to load quotation');
    }
  };

  const handleDuplicate = (id) => {
    duplicateQuotation(id);
    showSuccess('Quotation duplicated');
    onEditQuotation?.();
  };

  const handleDelete = async (id) => {
    const result = await deleteQuotation(id);
    if (result.success) {
      showSuccess('Quotation deleted');
    } else {
      showError(result.error || 'Failed to delete quotation');
    }
  };

  const SortHeader = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-accent-primary transition-colors"
    >
      {children}
      {sortField === field && (
        <ArrowUpDown className={`w-3 h-3 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg text-text-muted hover:text-text-primary hover:border-accent-primary transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
          </button>
          <span className="text-sm text-text-muted">
            {filteredQuotations.length} quotations
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg text-text-muted hover:text-accent-primary hover:bg-surface-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            newQuotation();
            onEditQuotation?.();
          }}
        >
          New Quotation
          <kbd className="kbd ml-1">⌘N</kbd>
        </Button>
      </div>

      {/* Search Modal */}
      <CenterSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onOpen={() => setShowSearchModal(true)}
        onSearch={setSearchQuery}
        placeholder="Search quotations..."
      />

      {/* Table */}
      <div className="bg-surface-800 rounded-xl border border-surface-600 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[80px_1fr_200px_150px_120px_150px_100px] gap-4 px-4 py-3
                      bg-surface-700 border-b border-surface-600 text-xs font-semibold
                      text-text-secondary uppercase tracking-wide">
          <SortHeader field="vchNo">Vch No</SortHeader>
          <SortHeader field="party">Party</SortHeader>
          <SortHeader field="salesman">Salesman</SortHeader>
          <SortHeader field="vchDate">Date</SortHeader>
          <span>Items</span>
          <SortHeader field="netAmount">Amount</SortHeader>
          <span>Actions</span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-surface-700">
          {isLoading && quotations.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-muted">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-accent-primary" />
              <p>Loading quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-muted">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No quotations found</p>
            </div>
          ) : (
            filteredQuotations.map((quotation, index) => (
              <motion.div
                key={quotation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-[80px_1fr_200px_150px_120px_150px_100px] gap-4 px-4 py-3
                          hover:bg-surface-700/50 transition-colors items-center"
              >
                <span className="font-mono text-accent-secondary font-medium">
                  #{String(quotation.vchNo).padStart(4, '0')}
                </span>

                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {quotation.party?.name || 'No party'}
                  </p>
                  {quotation.remark && (
                    <p className="text-xs text-text-muted truncate">{quotation.remark}</p>
                  )}
                </div>

                <span className="text-text-secondary text-sm">
                  {quotation.salesman?.name || '-'}
                </span>

                <span className="text-text-secondary text-sm">
                  {formatDate(quotation.vchDate)}
                </span>

                <span className="text-text-secondary text-sm">
                  {quotation.lineItems?.length || 0} items
                </span>

                <span className="font-mono font-medium text-text-primary">
                  {formatCurrency(quotation.totals?.netAmount || 0)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(quotation.id)}
                    className="p-1.5 rounded text-text-muted hover:text-accent-primary
                              hover:bg-accent-primary/10 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(quotation.id)}
                    className="p-1.5 rounded text-text-muted hover:text-accent-secondary
                              hover:bg-accent-secondary/10 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(quotation.id)}
                    className="p-1.5 rounded text-text-muted hover:text-accent-danger
                              hover:bg-accent-danger/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationList;
