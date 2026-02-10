import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Users, Package, FileText,
  IndianRupee, Calendar, Filter, Loader2, ArrowUpRight, ArrowDownRight,
  RotateCcw, Search, X, ChevronDown, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/formatters';

const API_BASE_URL = 'https://apiord.maitriceramic.com';
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const toDateStr = (d) => d.toISOString().split('T')[0];

const getPresetRange = (key) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (key) {
    case 'today': return { from: toDateStr(now), to: toDateStr(now) };
    case 'thisWeek': {
      const day = now.getDay();
      const mon = new Date(now);
      mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      return { from: toDateStr(mon), to: toDateStr(now) };
    }
    case 'thisMonth': return { from: toDateStr(new Date(y, m, 1)), to: toDateStr(now) };
    case 'lastMonth': return { from: toDateStr(new Date(y, m - 1, 1)), to: toDateStr(new Date(y, m, 0)) };
    case 'thisQuarter': {
      const qStart = Math.floor(m / 3) * 3;
      return { from: toDateStr(new Date(y, qStart, 1)), to: toDateStr(now) };
    }
    case 'thisYear': return { from: toDateStr(new Date(y, 0, 1)), to: toDateStr(now) };
    case 'lastYear': return { from: toDateStr(new Date(y - 1, 0, 1)), to: toDateStr(new Date(y - 1, 11, 31)) };
    case 'financialYear': {
      const fyStart = m >= 3 ? new Date(y, 3, 1) : new Date(y - 1, 3, 1);
      return { from: toDateStr(fyStart), to: toDateStr(now) };
    }
    default: return { from: '', to: '' };
  }
};

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisQuarter', label: 'This Quarter' },
  { key: 'financialYear', label: 'Financial Year' },
  { key: 'thisYear', label: 'This Year' },
  { key: 'lastYear', label: 'Last Year' },
];

const ChartCard = ({ title, iconBg = 'bg-blue-100', iconColor = 'text-blue-600', children, height = 300 }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-4" style={{ height }}>{children}</div>
  </div>
);

const KpiCard = ({ label, value, subLabel, iconBg = 'bg-blue-500', isLoading }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    {isLoading ? (
      <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
    ) : (
      <>
        <p className="text-xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {subLabel && <p className="text-[11px] text-slate-400 mt-0.5">{subLabel}</p>}
      </>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const FilterSelect = ({ label, icon: Icon, value, onChange, options, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-2.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const FilterInput = ({ label, icon: Icon, type = 'text', value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-2.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
    />
  </div>
);

export const ReportModule = () => {
  const [data, setData] = useState({ quotations: [], accounts: [], products: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [activePreset, setActivePreset] = useState('financialYear');

  const defaultRange = getPresetRange('financialYear');
  const [filters, setFilters] = useState({
    dateFrom: defaultRange.from,
    dateTo: defaultRange.to,
    party: '',
    company: '',
    state: '',
    minAmount: '',
    maxAmount: '',
    searchText: '',
  });

  useEffect(() => { fetchReportData(); }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const selectedOrg = useAuthStore.getState().selectedOrg;
      const currentYear = new Date().getFullYear();

      const [quotationsRes, accountsRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/quotation/filter`, {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ unOrgId: selectedOrg?.unId, yearCode: currentYear, accName: '', vchNo: '', page: 1, pageSize: 10000 })
        }),
        fetch(`${API_BASE_URL}/api/account/filter`, {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ name: '', page: 1, pageSize: 100000 })
        }),
        fetch(`${API_BASE_URL}/api/product/filter`, {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ page: 1, pageSize: 100000 })
        })
      ]);

      const [qData, aData, pData] = await Promise.all([
        quotationsRes.ok ? quotationsRes.json() : { data: [] },
        accountsRes.ok ? accountsRes.json() : { data: [] },
        productsRes.ok ? productsRes.json() : { data: [] },
      ]);

      const extract = (res) => { const p = res.data || res; return p.dataList || p.items || p.data || []; };

      setData({ quotations: extract(qData), accounts: extract(aData), products: extract(pData) });
    } catch (err) {
      console.error('Report fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const partyOptions = useMemo(() => {
    const set = new Set();
    data.quotations.forEach(q => { if (q.accName) set.add(q.accName); });
    return [...set].sort().map(n => ({ value: n, label: n }));
  }, [data.quotations]);

  const companyOptions = useMemo(() => {
    const set = new Set();
    data.products.forEach(p => { if (p.companyName) set.add(p.companyName); });
    return [...set].sort().map(n => ({ value: n, label: n }));
  }, [data.products]);

  const stateOptions = useMemo(() => {
    const set = new Set();
    data.accounts.forEach(a => { const s = a.stateName || a.city; if (s) set.add(s); });
    return [...set].sort().map(n => ({ value: n, label: n }));
  }, [data.accounts]);

  const filteredQuotations = useMemo(() => {
    return data.quotations.filter(q => {
      if (filters.dateFrom) {
        const d = new Date(q.vchDate);
        if (d < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        const d = new Date(q.vchDate);
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59);
        if (d > to) return false;
      }
      if (filters.party && q.accName !== filters.party) return false;
      if (filters.minAmount && (q.vchNetAmount || 0) < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && (q.vchNetAmount || 0) > parseFloat(filters.maxAmount)) return false;
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        const match = (q.accName || '').toLowerCase().includes(s) ||
          String(q.vchNo).includes(s);
        if (!match) return false;
      }
      return true;
    });
  }, [data.quotations, filters]);

  const filteredAccounts = useMemo(() => {
    return data.accounts.filter(a => {
      if (filters.state) {
        const s = a.stateName || a.city || '';
        if (s !== filters.state) return false;
      }
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        if (!(a.name || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [data.accounts, filters]);

  const filteredProducts = useMemo(() => {
    return data.products.filter(p => {
      if (filters.company && p.companyName !== filters.company) return false;
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        if (!(p.name || '').toLowerCase().includes(s) && !(p.skuCode || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [data.products, filters]);

  const handlePreset = useCallback((key) => {
    setActivePreset(key);
    const range = getPresetRange(key);
    setFilters(f => ({ ...f, dateFrom: range.from, dateTo: range.to }));
  }, []);

  const handleReset = useCallback(() => {
    const range = getPresetRange('financialYear');
    setActivePreset('financialYear');
    setFilters({ dateFrom: range.from, dateTo: range.to, party: '', company: '', state: '', minAmount: '', maxAmount: '', searchText: '' });
  }, []);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.party) c++;
    if (filters.company) c++;
    if (filters.state) c++;
    if (filters.minAmount) c++;
    if (filters.maxAmount) c++;
    if (filters.searchText) c++;
    if (activePreset !== 'financialYear') c++;
    return c;
  }, [filters, activePreset]);

  const monthlyData = useMemo(() => {
    const months = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach((m, i) => { months[i] = { month: m, amount: 0, count: 0 }; });
    filteredQuotations.forEach(q => {
      const d = new Date(q.vchDate);
      const m = d.getMonth();
      months[m].amount += q.vchNetAmount || 0;
      months[m].count += 1;
    });
    return Object.values(months);
  }, [filteredQuotations]);

  const topParties = useMemo(() => {
    const map = {};
    filteredQuotations.forEach(q => {
      const name = q.accName || 'Unknown';
      if (!map[name]) map[name] = { name, amount: 0, count: 0 };
      map[name].amount += q.vchNetAmount || 0;
      map[name].count += 1;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount).slice(0, 8);
  }, [filteredQuotations]);

  const companyWise = useMemo(() => {
    const map = {};
    filteredProducts.forEach(p => {
      const name = p.companyName || 'Other';
      if (!map[name]) map[name] = { name, count: 0 };
      map[name].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [filteredProducts]);

  const stateWise = useMemo(() => {
    const map = {};
    filteredAccounts.forEach(a => {
      const state = a.stateName || a.city || 'Unknown';
      if (!map[state]) map[state] = { name: state, count: 0 };
      map[state].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [filteredAccounts]);

  const totalValue = filteredQuotations.reduce((s, q) => s + (q.vchNetAmount || 0), 0);
  const avgValue = filteredQuotations.length > 0 ? totalValue / filteredQuotations.length : 0;
  const maxQ = filteredQuotations.reduce((max, q) => (q.vchNetAmount || 0) > max ? (q.vchNetAmount || 0) : max, 0);
  const minQ = filteredQuotations.length > 0
    ? filteredQuotations.reduce((min, q) => (q.vchNetAmount || 0) < min ? (q.vchNetAmount || 0) : min, Infinity)
    : 0;

  return (
    <div className="m-3 mb-0 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">Reports & Analytics</h1>
            <p className="text-sm text-slate-500">
              {filters.dateFrom && filters.dateTo
                ? `${new Date(filters.dateFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — ${new Date(filters.dateTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'All time'
              }
              {filteredQuotations.length !== data.quotations.length && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({filteredQuotations.length} of {data.quotations.length} quotations)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">{activeFilterCount}</span>
            )}
          </button>
          <button
            onClick={fetchReportData}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
          {/* Date Presets */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mr-1">Quick:</span>
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    activePreset === p.key
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Fields */}
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <FilterInput label="From Date" icon={Calendar} type="date" value={filters.dateFrom}
                onChange={(v) => { setFilters(f => ({ ...f, dateFrom: v })); setActivePreset(''); }} />
              <FilterInput label="To Date" icon={Calendar} type="date" value={filters.dateTo}
                onChange={(v) => { setFilters(f => ({ ...f, dateTo: v })); setActivePreset(''); }} />
              <FilterSelect label="Party" icon={Users} value={filters.party}
                onChange={(v) => setFilters(f => ({ ...f, party: v }))} options={partyOptions} placeholder="All Parties" />
              <FilterSelect label="Company" icon={Building2} value={filters.company}
                onChange={(v) => setFilters(f => ({ ...f, company: v }))} options={companyOptions} placeholder="All Companies" />
              <FilterSelect label="State" icon={Calendar} value={filters.state}
                onChange={(v) => setFilters(f => ({ ...f, state: v }))} options={stateOptions} placeholder="All States" />
              <FilterInput label="Min Amount" icon={IndianRupee} type="number" value={filters.minAmount}
                onChange={(v) => setFilters(f => ({ ...f, minAmount: v }))} placeholder="0" />
              <FilterInput label="Max Amount" icon={IndianRupee} type="number" value={filters.maxAmount}
                onChange={(v) => setFilters(f => ({ ...f, maxAmount: v }))} placeholder="No limit" />
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Search className="w-3 h-3" /> Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchText}
                    onChange={(e) => setFilters(f => ({ ...f, searchText: e.target.value }))}
                    placeholder="Party, Vch#..."
                    className="h-9 w-full px-2.5 pr-7 text-[13px] bg-white border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                  {filters.searchText && (
                    <button onClick={() => setFilters(f => ({ ...f, searchText: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                >
                  <X className="w-3 h-3" />
                  Clear All Filters
                </button>
                <span className="text-xs text-slate-400">
                  Showing {filteredQuotations.length} quotations · {filteredAccounts.length} accounts · {filteredProducts.length} products
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard icon={FileText} label="Quotations" iconBg="bg-blue-500"
          value={filteredQuotations.length} isLoading={isLoading} />
        <KpiCard icon={IndianRupee} label="Total Value" iconBg="bg-emerald-500"
          value={formatCurrency(totalValue)} isLoading={isLoading} />
        <KpiCard icon={TrendingUp} label="Avg. Value" iconBg="bg-violet-500"
          value={formatCurrency(avgValue)} isLoading={isLoading} />
        <KpiCard icon={ArrowUpRight} label="Highest" iconBg="bg-amber-500"
          value={formatCurrency(maxQ)} isLoading={isLoading} />
        <KpiCard icon={ArrowDownRight} label="Lowest" iconBg="bg-rose-500"
          value={formatCurrency(minQ === Infinity ? 0 : minQ)} isLoading={isLoading} />
        <KpiCard icon={Users} label="Accounts" iconBg="bg-cyan-500"
          value={filteredAccounts.length} subLabel={`${stateWise.length} states`} isLoading={isLoading} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <>
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ChartCard title="Monthly Quotation Trend" icon={TrendingUp} iconBg="bg-blue-100" iconColor="text-blue-600">
              <div style={{ height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="amount" name="Amount" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Top Parties by Value" icon={Users} iconBg="bg-emerald-100" iconColor="text-emerald-600">
              {topParties.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topParties} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="amount" nameKey="name">
                      {topParties.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                      formatter={(v) => <span className="text-[11px] text-slate-600">{v.length > 15 ? v.slice(0, 15) + '...' : v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </ChartCard>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Quotations per Month" icon={Calendar} iconBg="bg-violet-100" iconColor="text-violet-600">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Products by Company" icon={Package} iconBg="bg-amber-100" iconColor="text-amber-600">
              {companyWise.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyWise} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Products" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </ChartCard>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Accounts by State" icon={Users} iconBg="bg-cyan-100" iconColor="text-cyan-600">
              {stateWise.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateWise} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Accounts" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </ChartCard>

            <ChartCard title="Top Parties - Quotation Count" icon={FileText} iconBg="bg-rose-100" iconColor="text-rose-600">
              {topParties.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topParties} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Quotations" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportModule;
