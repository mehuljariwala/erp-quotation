import { useEffect } from 'react';
import {
  FileText,
  Users,
  Package,
  Building2,
  TrendingUp,
  ArrowRight,
  IndianRupee,
  MapPin,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/formatters';

const ValueSpinner = ({ size = 20 }) => (
  <Loader2
    className="animate-spin text-slate-300"
    style={{ width: size, height: size }}
    strokeWidth={2.5}
  />
);

const StatCard = ({ icon: Icon, label, value, subValue, onClick, isLoading, iconBg = 'bg-blue-500' }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:border-blue-300 hover:shadow-md transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300" />
    </div>
    <div className="mt-4">
      {isLoading ? (
        <div className="h-8 flex items-center">
          <ValueSpinner size={24} />
        </div>
      ) : (
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      )}
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {!isLoading && subValue && (
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          {subValue}
        </p>
      )}
    </div>
  </button>
);

const RecentQuotationRow = ({ quotation, onClick }) => (
  <tr
    onClick={onClick}
    className="hover:bg-slate-50 cursor-pointer transition-colors"
  >
    <td className="px-4 py-3">
      <span className="font-medium text-blue-600">#{quotation.vchNo}</span>
    </td>
    <td className="px-4 py-3">
      <span className="text-slate-800">{quotation.partyName || 'Unknown Party'}</span>
    </td>
    <td className="px-4 py-3 text-slate-500 text-sm">
      {new Date(quotation.vchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
    </td>
    <td className="px-4 py-3 text-slate-500 text-sm text-center hidden md:table-cell">
      {quotation.itemCount}
    </td>
    <td className="px-4 py-3 text-right">
      <span className="font-medium text-slate-800">{formatCurrency(quotation.netAmount)}</span>
    </td>
  </tr>
);

const TopAccountRow = ({ account }) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-medium overflow-hidden">
          {account.imageUrl ? (
            <img src={account.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            account.name?.charAt(0)?.toUpperCase()
          )}
        </div>
        <span className="text-slate-800 font-medium">{account.name}</span>
      </div>
    </td>
    <td className="px-4 py-3 text-slate-500 text-sm">
      {account.city && (
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {account.city}
        </span>
      )}
    </td>
    <td className="px-4 py-3 text-slate-500 text-sm">
      {account.phone}
    </td>
  </tr>
);

const ProductCard = ({ product }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all">
    <div className="h-24 bg-slate-100 flex items-center justify-center overflow-hidden">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <Package className="w-8 h-8 text-slate-300" />
      )}
    </div>
    <div className="p-3">
      <p className="font-medium text-slate-800 text-sm truncate">{product.name}</p>
      <p className="text-xs text-slate-400 font-mono truncate">{product.skuCode}</p>
      <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(product.mrp)}</p>
    </div>
  </div>
);

const TableSpinnerRows = ({ cols = 5, rows = 3 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-4 py-4">
            <ValueSpinner size={18} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="py-12 text-center">
    <Icon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
    <p className="text-slate-500 font-medium">{title}</p>
    <p className="text-slate-400 text-sm mt-1">{description}</p>
  </div>
);

export const Dashboard = ({ onNavigate }) => {
  const { stats, recentQuotations, topAccounts, recentProducts, isLoading, fetchDashboardData } = useDashboardStore();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showSpinner = isLoading;

  return (
    <div className="m-3 mb-0 bg-white rounded-lg border border-[#e2e8f0] shadow-sm min-h-full">
      <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={FileText}
          label="Total Quotations"
          value={stats.totalQuotations.toLocaleString()}
          subValue={`${stats.thisMonthQuotations} this month`}
          onClick={() => onNavigate?.('quotation')}
          isLoading={showSpinner}
        />
        <StatCard
          icon={Users}
          label="Total Accounts"
          value={stats.totalAccounts.toLocaleString()}
          onClick={() => onNavigate?.('account')}
          isLoading={showSpinner}
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats.totalProducts.toLocaleString()}
          onClick={() => onNavigate?.('product')}
          isLoading={showSpinner}
        />
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats.totalCompanies.toLocaleString()}
          onClick={() => onNavigate?.('company')}
          isLoading={showSpinner}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Quotation Value"
          value={formatCurrency(stats.quotationValue)}
          iconBg="bg-emerald-500"
          isLoading={showSpinner}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Quotations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Recent Quotations</h3>
            </div>
            <button
              onClick={() => onNavigate?.('quotation')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Vch No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Party</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Items</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {showSpinner ? (
                <TableSpinnerRows cols={5} rows={4} />
              ) : recentQuotations.length > 0 ? (
                recentQuotations.map((q) => (
                  <RecentQuotationRow
                    key={q.id}
                    quotation={q}
                    onClick={() => onNavigate?.('quotation')}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={FileText}
                      title="No quotations yet"
                      description="Create your first quotation to get started"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Top Accounts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Top Accounts</h3>
            </div>
            <button
              onClick={() => onNavigate?.('account')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-slate-100">
              {showSpinner ? (
                <TableSpinnerRows cols={3} rows={4} />
              ) : topAccounts.length > 0 ? (
                topAccounts.map((account) => (
                  <TopAccountRow key={account.id} account={account} />
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      icon={Users}
                      title="No accounts yet"
                      description="Add accounts to get started"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Recent Products</h3>
          </div>
          <button
            onClick={() => onNavigate?.('product')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          {showSpinner ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="h-24 bg-slate-50 flex items-center justify-center">
                    <ValueSpinner size={22} />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add products to your inventory"
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
