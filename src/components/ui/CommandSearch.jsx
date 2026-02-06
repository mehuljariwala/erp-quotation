import { useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search, X, Users, Package, FileText, Building2, Zap,
  Clock, ArrowRight, Command, CornerDownLeft,
} from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';

const TYPE_CONFIG = {
  account: { icon: Users, color: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  product: { icon: Package, color: 'bg-violet-100 text-violet-600', badge: 'bg-violet-50 text-violet-700 ring-violet-200' },
  quotation: { icon: FileText, color: 'bg-blue-100 text-blue-600', badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
  company: { icon: Building2, color: 'bg-amber-100 text-amber-600', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
  action: { icon: Zap, color: 'bg-rose-100 text-rose-600', badge: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'account', label: 'Accounts' },
  { key: 'product', label: 'Products' },
  { key: 'quotation', label: 'Quotations' },
  { key: 'company', label: 'Companies' },
  { key: 'action', label: 'Actions' },
];

function ShimmerRow({ delay }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 bg-slate-100 rounded-md animate-pulse" />
        <div className="h-3 w-28 bg-slate-50 rounded-md animate-pulse" />
      </div>
      <div className="h-5 w-16 bg-slate-50 rounded-full animate-pulse" />
    </motion.div>
  );
}

function ResultItem({ result, index, isSelected, onSelect, onHover }) {
  const config = TYPE_CONFIG[result.type] || TYPE_CONFIG.action;
  const Icon = config.icon;
  const ref = useRef(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onSelect(result)}
      onMouseEnter={() => onHover(index)}
      className={`
        group flex items-center gap-3 px-4 py-2.5 cursor-pointer
        transition-colors duration-100
        ${isSelected
          ? 'bg-blue-50/80 border-l-[3px] border-l-blue-500 pl-[13px]'
          : 'border-l-[3px] border-l-transparent hover:bg-slate-50/80'
        }
      `}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color} transition-transform duration-150 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
        <Icon className="w-[18px] h-[18px]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
          {result.title}
        </div>
        {result.subtitle && (
          <div className="text-[11.5px] text-slate-400 truncate mt-0.5 leading-tight">
            {result.subtitle}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset capitalize ${config.badge}`}>
          {result.type}
        </span>
        <ArrowRight className={`w-3.5 h-3.5 text-slate-300 transition-all duration-150 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'}`} />
      </div>
    </motion.div>
  );
}

export const CommandSearch = ({ isOpen, onClose, onSelect }) => {
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const query = useSearchStore(s => s.query);
  const results = useSearchStore(s => s.results);
  const isSearching = useSearchStore(s => s.isSearching);
  const selectedIndex = useSearchStore(s => s.selectedIndex);
  const activeCategory = useSearchStore(s => s.activeCategory);
  const recentSearches = useSearchStore(s => s.recentSearches);
  const setQuery = useSearchStore(s => s.setQuery);
  const setSelectedIndex = useSearchStore(s => s.setSelectedIndex);
  const setActiveCategory = useSearchStore(s => s.setActiveCategory);
  const close = useSearchStore(s => s.close);
  const clearRecentSearches = useSearchStore(s => s.clearRecentSearches);
  const addRecentSearch = useSearchStore(s => s.addRecentSearch);

  const accountResults = results?.account || [];
  const productResults = results?.product || [];
  const quotationResults = results?.quotation || [];
  const companyResults = results?.company || [];
  const actionResults = results?.action || [];

  const flatResults = useMemo(() => {
    if (activeCategory === 'account') return accountResults;
    if (activeCategory === 'product') return productResults;
    if (activeCategory === 'quotation') return quotationResults;
    if (activeCategory === 'company') return companyResults;
    if (activeCategory === 'action') return actionResults;
    return [...actionResults, ...quotationResults, ...accountResults, ...productResults, ...companyResults];
  }, [activeCategory, accountResults, productResults, quotationResults, companyResults, actionResults]);

  const categoryCounts = useMemo(() => ({
    account: accountResults.length,
    product: productResults.length,
    quotation: quotationResults.length,
    company: companyResults.length,
    action: actionResults.length,
    all: accountResults.length + productResults.length + quotationResults.length + companyResults.length + actionResults.length,
  }), [accountResults, productResults, quotationResults, companyResults, actionResults]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleSelect = useCallback((result) => {
    addRecentSearch(result);
    onSelect?.(result);
    close();
    onClose?.();
  }, [onSelect, close, onClose, addRecentSearch]);

  const handleKeyDown = useCallback((e) => {
    const count = flatResults.length;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setSelectedIndex(count > 0 ? (selectedIndex + 1) % count : 0);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setSelectedIndex(count > 0 ? (selectedIndex - 1 + count) % count : 0);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        close();
        onClose?.();
        break;
      }
      case 'Tab': {
        e.preventDefault();
        const currentIdx = CATEGORIES.findIndex(c => c.key === activeCategory);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + CATEGORIES.length) % CATEGORIES.length
          : (currentIdx + 1) % CATEGORIES.length;
        setActiveCategory(CATEGORIES[nextIdx].key);
        setSelectedIndex(0);
        break;
      }
      default:
        break;
    }
  }, [flatResults, selectedIndex, activeCategory, setSelectedIndex, setActiveCategory, handleSelect, close, onClose]);

  const hasQuery = query.trim().length > 0;
  const hasResults = flatResults.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { close(); onClose?.(); }}
          />

          <motion.div
            className="relative w-full max-w-2xl mx-4 mt-[18vh]"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.8 }}
          >
            <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col max-h-[72vh]">

              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search accounts, products, quotations..."
                  className="flex-1 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-medium"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setSelectedIndex(0); inputRef.current?.focus(); }}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                  <kbd className="kbd"><Command className="w-3 h-3" /></kbd>
                  <kbd className="kbd">K</kbd>
                </div>
              </div>

              {/* Category Tabs */}
              {hasQuery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 overflow-x-auto"
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    const count = categoryCounts[cat.key] || 0;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => { setActiveCategory(cat.key); setSelectedIndex(0); }}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                          whitespace-nowrap transition-all duration-150 cursor-pointer
                          ${isActive
                            ? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
                            : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700'
                          }
                        `}
                      >
                        {cat.label}
                        {count > 0 && (
                          <span className={`
                            text-[10px] font-semibold px-1.5 py-px rounded-full min-w-[18px] text-center
                            ${isActive ? 'bg-white/25 text-white' : 'bg-white text-slate-500'}
                          `}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Results Area */}
              <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">

                {/* Loading State */}
                {isSearching && (
                  <div className="py-2">
                    {[0, 1, 2, 3, 4].map(i => <ShimmerRow key={i} delay={i * 0.06} />)}
                  </div>
                )}

                {/* Results */}
                {!isSearching && hasQuery && hasResults && (
                  <div className="py-1.5">
                    {flatResults.map((result, idx) => (
                      <ResultItem
                        key={`${result.type}-${result.id}`}
                        result={result}
                        index={idx}
                        isSelected={idx === selectedIndex}
                        onSelect={handleSelect}
                        onHover={setSelectedIndex}
                      />
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!isSearching && hasQuery && !hasResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-center py-14 px-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">No results found</p>
                    <p className="text-xs text-slate-400 text-center max-w-xs">
                      Try adjusting your search or filter to find what you're looking for
                    </p>
                  </motion.div>
                )}

                {/* Empty State: Recent Searches + Quick Actions */}
                {!hasQuery && !isSearching && (
                  <div className="py-3">
                    {recentSearches?.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between px-4 py-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Recent
                          </span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.slice(0, 5).map((item, idx) => {
                          const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.action;
                          const Icon = config.icon;
                          return (
                            <motion.div
                              key={`recent-${item.id}-${idx}`}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04, duration: 0.2 }}
                              onClick={() => handleSelect(item)}
                              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors group"
                            >
                              <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[13px] text-slate-600 truncate flex-1">{item.title}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    <div>
                      <div className="px-4 py-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Quick Actions
                        </span>
                      </div>
                      {[
                        { label: 'New Quotation', desc: 'Create a new quotation', icon: FileText, type: 'quotation' },
                        { label: 'New Account', desc: 'Add a new account', icon: Users, type: 'account' },
                        { label: 'New Product', desc: 'Add a new product', icon: Package, type: 'product' },
                      ].map((action, idx) => {
                        const config = TYPE_CONFIG[action.type] || TYPE_CONFIG.action;
                        return (
                          <motion.div
                            key={action.label}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (recentSearches?.length || 0) * 0.04 + idx * 0.04, duration: 0.2 }}
                            onClick={() => handleSelect({ type: 'action', id: action.label, title: action.label, navigateTo: { module: action.type } })}
                            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors group"
                          >
                            <Zap className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                              <action.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-slate-700">{action.label}</div>
                              <div className="text-[11px] text-slate-400">{action.desc}</div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with keyboard hints */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="kbd">&uarr;</kbd>
                  <kbd className="kbd">&darr;</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="kbd"><CornerDownLeft className="w-2.5 h-2.5" /></kbd>
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="kbd">esc</kbd>
                  <span>Close</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="kbd">tab</kbd>
                  <span>Switch category</span>
                </div>
                {hasQuery && hasResults && (
                  <span className="ml-auto text-[11px] text-slate-400 font-mono">
                    {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandSearch;
