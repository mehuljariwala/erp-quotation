import { useState } from 'react';
import {
  Building2,
  Users,
  Package,
  FileText,
  FileCheck,
  Tag,
  Ruler,
  Receipt,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { Notifications } from './Notifications';
import { useAuthStore } from '../../stores/authStore';

const toolbarGroups = [
  {
    id: 'home',
    label: 'Home',
    modules: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    id: 'company',
    label: 'Company',
    modules: [
      { id: 'company', label: 'Company', icon: Building2 },
    ]
  },
  {
    id: 'account',
    label: 'Account',
    modules: [
      { id: 'account', label: 'Account', icon: Users },
    ]
  },
  {
    id: 'product',
    label: 'Product',
    modules: [
      { id: 'product', label: 'Product', icon: Package },
    ]
  },
  {
    id: 'transaction',
    label: 'Transaction',
    modules: [
      { id: 'quotation', label: 'Quotation', icon: FileText },
      { id: 'final-quotation', label: 'Final\nQuotation', icon: FileCheck },
    ]
  },
  {
    id: 'master',
    label: 'Master',
    modules: [
      { id: 'category', label: 'Categories', icon: Tag },
      { id: 'unit', label: 'Units', icon: Ruler },
      { id: 'pricelist', label: 'Price List', icon: Receipt },
    ]
  },
];

export const MainLayout = ({ children, activeModule, onModuleChange }) => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const selectedOrg = useAuthStore(state => state.selectedOrg);
  const organizationsUser = useAuthStore(state => state.organizationsUser);
  const setSelectedOrg = useAuthStore(state => state.setSelectedOrg);

  const getFinancialYear = () => {
    if (selectedOrg?.jsonFincYears) {
      try {
        const years = JSON.parse(selectedOrg.jsonFincYears);
        if (years.length > 0) {
          const current = years[years.length - 1];
          const fromYear = new Date(current.FromDate).getFullYear();
          const toYear = new Date(current.ToDate).getFullYear();
          return `${fromYear}-${String(toYear).slice(2)}`;
        }
      } catch { /* fall through to default */ }
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${String(startYear + 1).slice(2)}`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Ribbon Toolbar */}
      <div className="bg-linear-to-b from-[#d8e6f3] to-[#c8dcea] border-b border-[#9cb8d4]">
        <div className="flex items-stretch">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex md:hidden items-center justify-center w-12 h-15 text-slate-600 hover:bg-white/40 transition-colors"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Org + Financial Year */}
          <div className="flex items-center h-15 px-3 gap-2.5">
            <div className="w-1 h-7 rounded-full bg-[#3b82f6]" />
            <span className="px-2.5 py-1 text-[13px] font-semibold text-[#1e3a5f] bg-[#e8f0fe] rounded-md tracking-wide">
              {getFinancialYear()}
            </span>
            <div className="relative">
              {selectedOrg ? (
                <button
                  onClick={() => organizationsUser.length > 1 && setShowOrgDropdown(!showOrgDropdown)}
                  className="flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-white/40 transition-colors group"
                >
                  {selectedOrg.logoUrl ? (
                    <img src={selectedOrg.logoUrl} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                      {(selectedOrg.name || selectedOrg.alias || 'O').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[15px] font-semibold text-[#1e293b] tracking-tight max-w-28 md:max-w-none truncate">
                    {selectedOrg.name || selectedOrg.alias || 'My Company'}
                  </span>
                  {organizationsUser.length > 1 && (
                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all ${showOrgDropdown ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ) : (
                <span className="text-[15px] font-semibold text-[#1e293b] tracking-tight px-1.5">My Company</span>
              )}

              {showOrgDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowOrgDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Switch Organization</p>
                    </div>
                    <div className="max-h-70 overflow-y-auto py-1">
                      {organizationsUser.map((org) => (
                        <button
                          key={org.unId || org.id}
                          onClick={() => {
                            setSelectedOrg(org);
                            setShowOrgDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            selectedOrg?.unId === org.unId
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            selectedOrg?.unId === org.unId
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {org.logoUrl ? (
                              <img src={org.logoUrl} alt="" className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              (org.name || org.alias || 'O').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{org.name || org.alias || 'Organization'}</p>
                            {org.alias && org.alias !== org.name && (
                              <p className="text-xs text-slate-400 truncate">{org.alias}</p>
                            )}
                          </div>
                          {selectedOrg?.unId === org.unId && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-px bg-[#b0c4d8] hidden md:block" />

          {/* Module Buttons - hidden on mobile, icon-only on tablet, full on desktop */}
          <div className="hidden md:flex items-stretch overflow-x-auto lg:overflow-visible">
            {toolbarGroups.map((group, groupIndex) => (
              <div
                key={group.id}
                className={`flex items-end h-15 px-1 lg:px-2 gap-0.5 lg:gap-1 ${groupIndex > 0 ? 'border-l border-[#b0c4d8]' : ''}`}
              >
                  {group.modules.map((module) => {
                    const Icon = module.icon;
                    const isActive = activeModule === module.id;
                    const isHovered = hoveredModule === module.id;

                    return (
                      <button
                        key={module.id}
                        onClick={() => onModuleChange(module.id)}
                        onMouseEnter={() => setHoveredModule(module.id)}
                        onMouseLeave={() => setHoveredModule(null)}
                        className={`
                          flex flex-col items-center justify-center px-1.5 lg:px-2 py-1 min-w-9 lg:min-w-13 h-13.5 rounded
                          transition-all duration-100
                          ${isActive
                            ? 'bg-linear-to-b from-[#ffefc8] to-[#ffe8a0] border border-[#d4a800] shadow-sm'
                            : isHovered
                              ? 'bg-linear-to-b from-white/60 to-white/30 border border-[#c0d0e4]'
                              : 'border border-transparent'
                          }
                        `}
                      >
                        <div className={`
                          w-7 h-7 flex items-center justify-center
                          ${isActive ? 'text-amber-700' : 'text-slate-600'}
                        `}>
                          <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className={`
                          hidden lg:block text-[10px] leading-tight text-center whitespace-pre-line mt-0.5
                          ${isActive ? 'text-amber-800 font-medium' : 'text-slate-700'}
                        `}>
                          {module.label}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* User Avatar */}
          <div className="flex items-center px-3 border-l border-[#b0c4d8]">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-white/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white/80">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[#b0c4d8] bg-[#e0ecf5] max-h-[70vh] overflow-y-auto">
            <div className="py-2 px-3 space-y-0.5">
              {toolbarGroups.map((group) => (
                <div key={group.id}>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2.5 pb-1">
                    {group.label}
                  </div>
                  {group.modules.map((module) => {
                    const Icon = module.icon;
                    const isActive = activeModule === module.id;
                    return (
                      <button
                        key={module.id}
                        onClick={() => {
                          onModuleChange(module.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'text-slate-700 hover:bg-white/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-amber-700' : 'text-slate-500'}`} strokeWidth={1.5} />
                        <span className="text-sm font-medium">{module.label.replace('\n', ' ')}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f4f8]">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <Notifications />

    </div>
  );
};

export default MainLayout;
