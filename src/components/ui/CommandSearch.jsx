import { useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Search, X, Users, Package, FileText, Building2, Zap,
  Clock, ArrowRight, CornerDownLeft, Hash,
  LayoutDashboard, Tag, Ruler, Receipt, BarChart3, Shield,
  FileCheck, Plus, Sparkles, IndianRupee, Calendar,
  MapPin, Phone, Mail, Trash2,
} from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';
import { formatCurrency } from '../../utils/formatters';

const TYPE_CONFIG = {
  account: { icon: Users, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Account' },
  product: { icon: Package, color: 'from-violet-400 to-purple-500', bg: 'bg-violet-500/10', text: 'text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Product' },
  quotation: { icon: FileText, color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-500/10', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Quotation' },
  company: { icon: Building2, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Company' },
  action: { icon: Zap, color: 'from-slate-400 to-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Navigate' },
  create: { icon: Plus, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-500/10', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-600 border-rose-200', label: 'Create' },
};

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  quotation: FileText,
  account: Users,
  product: Package,
  company: Building2,
  category: Tag,
  unit: Ruler,
  pricelist: Receipt,
  report: BarChart3,
  user: Shield,
  'final-quotation': FileCheck,
};

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Sparkles },
  { key: 'quotation', label: 'Quotations', icon: FileText },
  { key: 'account', label: 'Accounts', icon: Users },
  { key: 'product', label: 'Products', icon: Package },
  { key: 'company', label: 'Companies', icon: Building2 },
  { key: 'action', label: 'Navigate', icon: Zap },
];

const spring = { type: 'spring', damping: 35, stiffness: 500, mass: 0.6 };

const ShimmerRow = memo(({ delay }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-center gap-3 px-5 py-3"
  >
    <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-slate-100 to-slate-50 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-44 bg-slate-100 rounded-lg animate-pulse" />
      <div className="h-3 w-28 bg-slate-50 rounded-lg animate-pulse" />
    </div>
    <div className="h-5 w-16 bg-slate-50 rounded-full animate-pulse" />
  </motion.div>
));
ShimmerRow.displayName = 'ShimmerRow';

const ResultIcon = memo(({ result }) => {
  const config = TYPE_CONFIG[result.type] || TYPE_CONFIG.action;

  if (result.meta?.imageUrl) {
    return (
      <div className="w-10 h-10 rounded-[14px] overflow-hidden ring-1 ring-black/[0.06] shadow-sm shrink-0">
        <img
          src={result.meta.imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('bg-linear-to-br', ...config.color.split(' '), 'flex', 'items-center', 'justify-center');
            const icon = document.createElement('div');
            icon.className = 'text-white';
            e.target.parentElement.appendChild(icon);
          }}
        />
      </div>
    );
  }

  const NavIcon = (result.type === 'action' || result.type === 'create') && result.navigateTo?.module
    ? (NAV_ICONS[result.navigateTo.module] || config.icon)
    : config.icon;

  return (
    <div className={`w-10 h-10 rounded-[14px] bg-linear-to-br ${config.color} flex items-center justify-center shrink-0 shadow-sm`}>
      <NavIcon className="w-[18px] h-[18px] text-white" strokeWidth={2} />
    </div>
  );
});
ResultIcon.displayName = 'ResultIcon';

const ResultItem = memo(({ result, index, isSelected, onSelect, onHover }) => {
  const config = TYPE_CONFIG[result.type] || TYPE_CONFIG.action;
  const ref = useRef(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onSelect(result)}
      onMouseEnter={() => onHover(index)}
      className={`
        group relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-100 ease-out
        ${isSelected
          ? 'bg-linear-to-r from-blue-50 to-indigo-50/50 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_1px_3px_rgba(59,130,246,0.08)]'
          : 'hover:bg-slate-50/80'
        }
      `}
    >
      <ResultIcon result={result} />

      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-semibold truncate leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
          {result.title}
        </div>
        {result.subtitle && (
          <div className="text-[11.5px] text-slate-400 truncate mt-0.5 leading-tight">
            {result.subtitle}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${config.badge}`}>
          {config.label}
        </span>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1"
          >
            <kbd className="cmd-kbd">
              <CornerDownLeft className="w-2.5 h-2.5" />
            </kbd>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});
ResultItem.displayName = 'ResultItem';

const SectionHeader = memo(({  label, count }) => (
  <div className="flex items-center gap-2 px-5 pt-3 pb-1.5">
    <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">
      {label}
    </span>
    {count > 0 && (
      <span className="text-[10px] font-semibold text-slate-300 bg-slate-100 px-1.5 py-px rounded-md">
        {count}
      </span>
    )}
  </div>
));
SectionHeader.displayName = 'SectionHeader';

const PreviewPanel = memo(({ result }) => {
  if (!result) return null;
  const config = TYPE_CONFIG[result.type] || TYPE_CONFIG.action;

  return (
    <motion.div
      key={result.id}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="h-full flex flex-col"
    >
      <div className={`px-5 py-4 bg-linear-to-br ${config.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative flex items-start gap-3">
          {result.meta?.imageUrl ? (
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 shadow-lg ring-1 ring-white/30 shrink-0">
              <img src={result.meta.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/30 flex items-center justify-center shrink-0">
              {(() => { const Icon = config.icon; return <Icon className="w-6 h-6 text-white" />; })()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate">{result.title}</h3>
            {result.subtitle && (
              <p className="text-xs text-white/70 mt-0.5 truncate">{result.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {result.type === 'quotation' && result.meta && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <MetaCard icon={Calendar} label="Date" value={result.meta.date || '\u2014'} />
              <MetaCard icon={IndianRupee} label="Amount" value={result.meta.amount ? formatCurrency(result.meta.amount) : '\u2014'} />
              <MetaCard icon={Users} label="Party" value={result.meta.partyName || '\u2014'} />
              <MetaCard icon={Package} label="Items" value={String(result.meta.items || 0)} />
            </div>
            {result.meta.remark && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remark</p>
                <p className="text-xs text-slate-600">{result.meta.remark}</p>
              </div>
            )}
          </>
        )}
        {result.type === 'account' && result.meta && (
          <div className="space-y-2">
            {result.meta.phone && <MetaRow icon={Phone} value={result.meta.phone} />}
            {result.meta.email && <MetaRow icon={Mail} value={result.meta.email} />}
            {result.meta.city && <MetaRow icon={MapPin} value={result.meta.city} />}
            {result.meta.alias && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alias</p>
                <p className="text-xs text-slate-600">{result.meta.alias}</p>
              </div>
            )}
          </div>
        )}
        {result.type === 'product' && result.meta && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <MetaCard icon={IndianRupee} label="MRP" value={result.meta.mrp ? `\u20b9${result.meta.mrp.toLocaleString('en-IN')}` : '\u2014'} />
              <MetaCard icon={Hash} label="SKU" value={result.meta.skuCode || '\u2014'} />
              <MetaCard icon={Building2} label="Company" value={result.meta.companyName || '\u2014'} />
              <MetaCard icon={Tag} label="Category" value={result.meta.categoryName || '\u2014'} />
            </div>
            {result.meta.gst != null && (
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">GST</span>
                <span className="text-xs font-semibold text-amber-600">{result.meta.gst}%</span>
              </div>
            )}
          </>
        )}
        {(result.type === 'action' || result.type === 'create') && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${config.color} flex items-center justify-center mb-3 shadow-lg`}>
              {(() => {
                const NavIcon = result.navigateTo?.module ? (NAV_ICONS[result.navigateTo.module] || config.icon) : config.icon;
                return <NavIcon className="w-5 h-5 text-white" />;
              })()}
            </div>
            <p className="text-sm font-semibold text-slate-700">{result.title}</p>
            <p className="text-xs text-slate-400 mt-1">{result.subtitle}</p>
            <p className="text-[11px] text-slate-300 mt-3">
              Press <kbd className="cmd-kbd mx-0.5">Enter</kbd> to {result.type === 'create' ? 'create' : 'navigate'}
            </p>
          </div>
        )}
        {result.type === 'company' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {result.meta?.imageUrl ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-md mb-3">
                <img src={result.meta.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${config.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Building2 className="w-7 h-7 text-white" />
              </div>
            )}
            <p className="text-sm font-semibold text-slate-700">{result.title}</p>
            {result.meta?.alias && <p className="text-xs text-slate-400 mt-0.5">{result.meta.alias}</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
});
PreviewPanel.displayName = 'PreviewPanel';

const MetaCard = ({  label, value }) => (
  <div className="bg-slate-50 rounded-xl p-2.5">
    <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xs font-semibold text-slate-700 truncate">{value}</p>
  </div>
);

const MetaRow = ({ value }) => (
  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl">
    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    <span className="text-xs text-slate-600 truncate">{value}</span>
  </div>
);

const IntentBadge = memo(({ intent }) => {
  if (!intent) return null;

  const labels = {
    navigate: 'Navigating',
    create: 'Creating',
    quotation_search: 'Searching quotations by party',
    product_price: `Products ${intent.operator} \u20b9${intent.price?.toLocaleString()}`,
    quotation_number: 'Finding quotation #',
    number_search: 'Number search',
    search: 'Searching',
    general: null,
  };

  const label = labels[intent.type];
  if (!label) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-violet-50 to-blue-50 border-b border-violet-100/50"
    >
      <Sparkles className="w-3 h-3 text-violet-500" />
      <span className="text-[11px] font-semibold text-violet-600">{label}</span>
    </motion.div>
  );
});
IntentBadge.displayName = 'IntentBadge';

export const CommandSearch = ({ onNavigate }) => {
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isOpen = useSearchStore(s => s.isOpen);
  const query = useSearchStore(s => s.query);
  const results = useSearchStore(s => s.results);
  const isSearching = useSearchStore(s => s.isSearching);
  const selectedIndex = useSearchStore(s => s.selectedIndex);
  const activeCategory = useSearchStore(s => s.activeCategory);
  const recentSearches = useSearchStore(s => s.recentSearches);
  const intent = useSearchStore(s => s.intent);
  const setQuery = useSearchStore(s => s.setQuery);
  const setSelectedIndex = useSearchStore(s => s.setSelectedIndex);
  const setActiveCategory = useSearchStore(s => s.setActiveCategory);
  const close = useSearchStore(s => s.close);
  const toggle = useSearchStore(s => s.toggle);
  const clearRecentSearches = useSearchStore(s => s.clearRecentSearches);
  const removeRecentSearch = useSearchStore(s => s.removeRecentSearch);
  const addRecentSearch = useSearchStore(s => s.addRecentSearch);

  const flatResults = useMemo(() => {
    if (activeCategory !== 'all') return results[activeCategory] || [];
    return [
      ...(results.action || []),
      ...(results.create || []),
      ...(results.quotation || []),
      ...(results.account || []),
      ...(results.product || []),
      ...(results.company || []),
    ];
  }, [activeCategory, results]);

  const groupedResults = useMemo(() => {
    if (activeCategory !== 'all') return null;
    const groups = [];
    if (results.action?.length > 0 || results.create?.length > 0) {
      groups.push({ type: 'action', label: 'Actions', icon: Zap, items: [...(results.action || []), ...(results.create || [])] });
    }
    if (results.quotation?.length > 0) {
      groups.push({ type: 'quotation', label: 'Quotations', icon: FileText, items: results.quotation });
    }
    if (results.account?.length > 0) {
      groups.push({ type: 'account', label: 'Accounts', icon: Users, items: results.account });
    }
    if (results.product?.length > 0) {
      groups.push({ type: 'product', label: 'Products', icon: Package, items: results.product });
    }
    if (results.company?.length > 0) {
      groups.push({ type: 'company', label: 'Companies', icon: Building2, items: results.company });
    }
    return groups;
  }, [activeCategory, results]);

  const categoryCounts = useMemo(() => ({
    account: results.account?.length || 0,
    product: results.product?.length || 0,
    quotation: results.quotation?.length || 0,
    company: results.company?.length || 0,
    action: (results.action?.length || 0) + (results.create?.length || 0),
    all: (results.account?.length || 0) + (results.product?.length || 0) + (results.quotation?.length || 0) + (results.company?.length || 0) + (results.action?.length || 0) + (results.create?.length || 0),
  }), [results]);

  const selectedResult = flatResults[selectedIndex] || null;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [toggle]);

  const handleSelect = useCallback((result) => {
    addRecentSearch(result);
    if (result.navigateTo) {
      onNavigate?.(result.navigateTo.module, result.navigateTo);
    }
    close();
  }, [onNavigate, close, addRecentSearch]);

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
  }, [flatResults, selectedIndex, activeCategory, setSelectedIndex, setActiveCategory, handleSelect, close]);

  const hasQuery = query.trim().length > 0;
  const hasResults = flatResults.length > 0;

  let globalIdx = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-200 flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />

          {/* Command Palette */}
          <motion.div
            className="relative w-full max-w-[860px] mx-4 mt-[12vh]"
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={spring}
          >
            <div className="cmd-palette overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
              {/* Search Bar */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/60">
                <div className="relative">
                  <Search className={`w-5 h-5 transition-colors duration-200 ${isSearching ? 'text-violet-500' : 'text-slate-400'}`} />
                  {isSearching && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-1.5 h-1.5 bg-violet-500 rounded-full absolute -top-0.5 left-1/2 -translate-x-1/2" />
                    </motion.div>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search anything... try &quot;quotation for amit&quot; or &quot;go to dashboard&quot;"
                  className="flex-1 text-[15px] text-slate-800 placeholder:text-slate-350 outline-none bg-transparent font-medium tracking-[-0.01em]"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
                <div className="flex items-center gap-1 pl-3 border-l border-slate-200/60">
                  <kbd className="cmd-kbd text-[10px]">{/Mac|iPhone|iPad/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}</kbd>
                  <kbd className="cmd-kbd text-[10px]">K</kbd>
                </div>
              </div>

              {/* Intent Badge */}
              <AnimatePresence>
                {hasQuery && intent && intent.type !== 'general' && (
                  <IntentBadge intent={intent} />
                )}
              </AnimatePresence>

              {/* Category Tabs */}
              {hasQuery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 overflow-x-auto"
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    const count = categoryCounts[cat.key] || 0;
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => { setActiveCategory(cat.key); setSelectedIndex(0); }}
                        className={`
                          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold
                          whitespace-nowrap transition-all duration-150 cursor-pointer
                          ${isActive
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }
                        `}
                      >
                        <CatIcon className="w-3 h-3" />
                        {cat.label}
                        {count > 0 && (
                          <span className={`
                            text-[9px] font-bold px-1.5 py-px rounded-md min-w-[16px] text-center
                            ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}
                          `}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Main Content: Results + Preview */}
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Results List */}
                <div
                  ref={listRef}
                  className={`flex-1 overflow-y-auto overscroll-contain ${hasResults && hasQuery ? 'border-r border-slate-100' : ''}`}
                  style={{ minWidth: hasResults && hasQuery ? '55%' : '100%' }}
                >
                  {/* Loading */}
                  {isSearching && (
                    <div className="py-2">
                      {[0, 1, 2, 3].map(i => <ShimmerRow key={i} delay={i * 0.05} />)}
                    </div>
                  )}

                  {/* Grouped Results */}
                  {!isSearching && hasQuery && hasResults && groupedResults && activeCategory === 'all' && (
                    <div className="py-2">
                      {groupedResults.map((group) => (
                        <div key={group.type}>
                          <SectionHeader icon={group.icon} label={group.label} count={group.items.length} />
                          {group.items.map((result) => {
                            globalIdx++;
                            const idx = globalIdx;
                            return (
                              <ResultItem
                                key={`${result.type}-${result.id}`}
                                result={result}
                                index={idx}
                                isSelected={idx === selectedIndex}
                                onSelect={handleSelect}
                                onHover={setSelectedIndex}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flat Results (filtered category) */}
                  {!isSearching && hasQuery && hasResults && activeCategory !== 'all' && (
                    <div className="py-2">
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
                      className="flex flex-col items-center justify-center py-16 px-6"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <Search className="w-7 h-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-1">No matches found</p>
                      <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
                        Try a different search term, or use natural language like "quotation for amit" or "go to products"
                      </p>
                    </motion.div>
                  )}

                  {/* Empty State */}
                  {!hasQuery && !isSearching && (
                    <div className="py-2">
                      {recentSearches?.length > 0 && (
                        <div className="mb-1">
                          <div className="flex items-center justify-between px-5 pt-2 pb-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">
                                Recent
                              </span>
                            </div>
                            <button
                              onClick={clearRecentSearches}
                              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer font-medium"
                            >
                              Clear all
                            </button>
                          </div>
                          {recentSearches.slice(0, 6).map((item, idx) => {
                            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.action;
                            return (
                              <motion.div
                                key={`recent-${item.id}-${idx}`}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03, duration: 0.15 }}
                                onClick={() => handleSelect(item)}
                                className="group flex items-center gap-3 mx-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                              >
                                <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${config.color} flex items-center justify-center shrink-0 shadow-sm`}>
                                  {(() => { const Icon = config.icon; return <Icon className="w-3.5 h-3.5 text-white" />; })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[13px] font-medium text-slate-700 truncate block">{item.title}</span>
                                  {item.subtitle && <span className="text-[11px] text-slate-400 truncate block">{item.subtitle}</span>}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeRecentSearch(item.id); }}
                                  className="p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 px-5 pt-3 pb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">
                            Try asking
                          </span>
                        </div>
                        {[
                          { q: 'Go to dashboard', desc: 'Navigate anywhere instantly' },
                          { q: 'Quotation for amit', desc: 'Smart party-based search' },
                          { q: 'Products above 5000', desc: 'Filter by price range' },
                          { q: '#0042', desc: 'Find quotation by number' },
                          { q: 'New quotation', desc: 'Quick-create anything' },
                        ].map((hint, idx) => (
                          <motion.div
                            key={hint.q}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (recentSearches?.length || 0) * 0.03 + idx * 0.03, duration: 0.15 }}
                            onClick={() => setQuery(hint.q)}
                            className="group flex items-center gap-3 mx-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-violet-50/60 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-400/10 to-blue-400/10 border border-violet-200/40 flex items-center justify-center shrink-0">
                              <Search className="w-3.5 h-3.5 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] font-semibold text-violet-700 group-hover:text-violet-800">{hint.q}</span>
                              <span className="text-[11px] text-slate-400 block">{hint.desc}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Panel */}
                <AnimatePresence mode="wait">
                  {hasQuery && hasResults && selectedResult && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '45%' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="hidden lg:flex flex-col overflow-hidden bg-white"
                    >
                      <PreviewPanel result={selectedResult} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-5 px-5 py-2.5 border-t border-slate-200/60 bg-slate-50/80">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="cmd-kbd">&uarr;</kbd>
                  <kbd className="cmd-kbd">&darr;</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="cmd-kbd"><CornerDownLeft className="w-2.5 h-2.5" /></kbd>
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="cmd-kbd text-[9px]">tab</kbd>
                  <span>Category</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <kbd className="cmd-kbd text-[9px]">esc</kbd>
                  <span>Close</span>
                </div>
                {hasQuery && hasResults && (
                  <span className="ml-auto text-[11px] font-semibold text-slate-400 font-mono tabular-nums">
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
