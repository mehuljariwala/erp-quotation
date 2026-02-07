import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, Copy, RefreshCw,
  FileText, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
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
  const [searchValue, setSearchValue] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const searchTimeoutRef = useRef(null);
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

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
    }, 300);
  };

  const filteredQuotations = useMemo(() => {
    if (!filterName) return quotations;
    const query = filterName.toLowerCase();
    return quotations.filter(q =>
      q.party?.name?.toLowerCase().includes(query) ||
      q.vchNo?.toString().includes(query) ||
      q.remark?.toLowerCase().includes(query)
    );
  }, [quotations, filterName]);

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

  return (
    <div className="h-full flex flex-col">
      <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Quotations</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredQuotations.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                placeholder="Search quotations..."
                className="h-8 w-full md:w-56 pl-8 pr-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={() => fetchQuotations()}
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
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-14">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Vch No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">Vch Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Party</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Ref Person</th>
                <th className="hidden md:table-cell text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-36">Net Amount</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && quotations.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`loader-${i}`}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No quotations found</p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q, index) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedId(q.id)}
                    onDoubleClick={() => handleEdit(q.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedId === q.id ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        #{String(q.vchNo).padStart(4, '0')}
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
                      <span className="text-sm text-slate-600">{q.refPersonName || q.reference?.name || '\u2014'}</span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {q.lineItems?.length || q.qty || 0}
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
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(q.id); }}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationList;
