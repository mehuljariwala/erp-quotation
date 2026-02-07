import { useState, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, FileCheck, Pencil, Trash2, Plus,
  ChevronLeft, ChevronRight, Loader2, ChevronDown,
  Package, MapPin, Tag, Percent, IndianRupee
} from 'lucide-react';
import { useQuotationStore } from '../../stores/quotationStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ExpandedRow = ({ lineItems, totals }) => {
  if (!lineItems || lineItems.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-slate-400">
        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        No product details available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden"
    >
      <div className="px-5 py-4 bg-gradient-to-b from-slate-50/80 to-white border-t border-slate-100 overflow-x-auto">
        <div className="grid gap-2.5">
          {lineItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-150"
            >
              <div className="flex items-center justify-center w-6 text-xs font-semibold text-slate-300">
                {idx + 1}
              </div>

              <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                {item.productImageUrl ? (
                  <img
                    src={item.productImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className={`w-full h-full items-center justify-center text-sm font-bold text-slate-400 ${item.productImageUrl ? 'hidden' : 'flex'}`}
                >
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {item.productName || item.description || 'Unnamed Product'}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {item.skuCode && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Tag className="w-3 h-3" />
                      {item.skuCode}
                    </span>
                  )}
                  {item.area && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {item.area}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-center w-16">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">MRP</div>
                  <div className="font-mono text-xs font-medium text-slate-700">{formatCurrency(item.mrp, { showSymbol: false })}</div>
                </div>
                <div className="text-center w-12">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Qty</div>
                  <div className="font-mono text-xs font-semibold text-slate-800">{item.qty}</div>
                </div>
                <div className="text-center w-14">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Disc%</div>
                  <div className="font-mono text-xs text-amber-600">{item.discPercent || 0}%</div>
                </div>
                <div className="text-center w-14">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">GST%</div>
                  <div className="font-mono text-xs text-slate-600">{item.gstPercent || 0}%</div>
                </div>
                <div className="text-right w-24">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Net</div>
                  <div className="font-mono text-sm font-semibold text-blue-600">{formatCurrency(item.netAmount || 0, { showSymbol: false })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totals && (
          <div className="flex justify-end mt-3 pt-3 border-t border-dashed border-slate-200">
            <div className="flex flex-wrap items-center gap-6 px-4 py-2 bg-blue-50/70 rounded-lg">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Items</span>
                <p className="font-mono text-xs font-semibold text-slate-700">{totals.totalItems}</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Gross</span>
                <p className="font-mono text-xs text-slate-600">{formatCurrency(totals.grossAmount, { showSymbol: false })}</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Discount</span>
                <p className="font-mono text-xs text-red-500">-{formatCurrency(totals.discountAmount, { showSymbol: false })}</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">GST</span>
                <p className="font-mono text-xs text-slate-600">{formatCurrency(totals.gstAmount, { showSymbol: false })}</p>
              </div>
              <div className="text-center pl-3 border-l border-blue-200">
                <span className="text-[10px] uppercase tracking-wider text-blue-500">Total</span>
                <p className="font-mono text-sm font-bold text-blue-600">{formatCurrency(totals.netAmount)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const FinalQuotationModule = ({ onEditQuotation }) => {
  const {
    quotations,
    fetchQuotations,
    loadQuotation,
    deleteQuotation,
    newQuotation,
    isLoading
  } = useQuotationStore();
  const { showSuccess, showError } = useUIStore();

  const [searchValue, setSearchValue] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const searchTimeoutRef = useRef(null);
  const [filterName, setFilterName] = useState('');

  const doFetch = async () => {
    const result = await fetchQuotations({ page, pageSize, accName: filterName });
    if (result?.success) {
      setTotalCount(result.totalCount || result.data?.length || 0);
      setTotalPages(result.totalPages || 1);
    }
  };

  useEffect(() => {
    doFetch();
  }, [page, filterName]);

  useEffect(() => {
    if (quotations.length > 0 && !selectedId) {
      setSelectedId(quotations[0].id);
    }
  }, [quotations]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFilterName(value);
      setPage(1);
    }, 300);
  };

  const handleEdit = async (id) => {
    const result = await loadQuotation(id);
    if (result.success) {
      onEditQuotation?.();
    } else {
      showError(result.error || 'Failed to load quotation');
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteQuotation(id);
    if (result.success) {
      showSuccess('Quotation deleted');
    } else {
      showError(result.error || 'Failed to delete quotation');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const displayCount = totalCount || quotations.length;
  const displayPages = totalPages || Math.max(1, Math.ceil(displayCount / pageSize));

  return (
    <div className="h-full flex flex-col">
      <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Final Quotations</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{displayCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                placeholder="Search by party name..."
                className="h-8 w-full md:w-56 pl-8 pr-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={doFetch}
              disabled={isLoading}
              className="h-8 px-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                newQuotation();
                onEditQuotation?.();
              }}
              className="flex items-center gap-1.5 h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Quotation
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-2 py-3" />
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Vch No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">Vch Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Party</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Reference</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Ref Person</th>
                <th className="hidden md:table-cell text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-36">Net Amount</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && quotations.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`loader-${i}`}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No quotations found</p>
                  </td>
                </tr>
              ) : (
                quotations.map((q, index) => {
                  const isExpanded = expandedId === q.id;
                  const hasLineItems = q.lineItems && q.lineItems.length > 0;
                  return (
                    <Fragment key={q.id}>
                      <tr
                        onClick={() => setSelectedId(q.id)}
                        onDoubleClick={() => handleEdit(q.id)}
                        className={`cursor-pointer transition-colors border-b border-slate-100 ${
                          isExpanded ? 'bg-blue-50/60' : selectedId === q.id ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="w-10 px-2 py-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(q.id); }}
                            className={`w-7 h-7 inline-flex items-center justify-center rounded-md transition-all duration-200 ${
                              hasLineItems
                                ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                : 'text-slate-200 cursor-default'
                            }`}
                            disabled={!hasLineItems}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            #{q.vchNoDisplay || String(q.vchNo).padStart(4, '0')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{formatDate(q.vchDate)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
                              {q.party?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {q.party?.name || 'No party'}
                              </p>
                              {q.remark && (
                                <p className="text-xs text-slate-400 truncate">{q.remark}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3">
                          <span className="text-sm text-slate-600">{q.reference?.name || '\u2014'}</span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3">
                          <span className="text-sm text-slate-600">{q.refPersonName || '\u2014'}</span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {q.qty || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-medium text-slate-800">
                            {formatCurrency(q.totals?.netAmount || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(q.id); }}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="p-0">
                              <ExpandedRow lineItems={q.lineItems} totals={q.totals} />
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {quotations.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <p className="text-sm text-slate-600 hidden md:block">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, displayCount)} of {displayCount} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg">
                {page} / {displayPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(displayPages, p + 1))}
                disabled={page >= displayPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalQuotationModule;
