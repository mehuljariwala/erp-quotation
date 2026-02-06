import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Users,
  UserCircle,
  Package,
  FileText,
  FileCheck,
  User,
  HardDrive,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Search,
  Command,
  ArrowRightLeft
} from 'lucide-react';
import { Notifications } from './Notifications';
import { CommandSearch } from '../ui/CommandSearch';
import { OrgSelectorModal } from '../auth/OrgSelectorModal';
import { useAuthStore } from '../../stores/authStore';
import { useSearchStore } from '../../stores/searchStore';

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
    id: 'utility',
    label: 'Utility',
    modules: [
      { id: 'user', label: 'User', icon: User },
      { id: 'backup', label: 'Backup', icon: HardDrive },
      { id: 'setting', label: 'Setting', icon: Settings },
    ]
  },
];

export const MainLayout = ({ children, activeModule, onModuleChange }) => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const selectedOrg = useAuthStore(state => state.selectedOrg);
  const organizationsUser = useAuthStore(state => state.organizationsUser);
  const setSelectedOrg = useAuthStore(state => state.setSelectedOrg);
  const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'k')) {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  const handleSearchSelect = useCallback((result) => {
    if (result?.navigateTo?.module) {
      onModuleChange(result.navigateTo.module);
    }
  }, [onModuleChange]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Ribbon Toolbar */}
      <div className="bg-gradient-to-b from-[#d8e6f3] to-[#c8dcea] border-b border-[#9cb8d4]">
        <div className="flex items-stretch">
          {toolbarGroups.map((group, groupIndex) => (
            <div
              key={group.id}
              className={`flex items-end h-[60px] px-2 gap-1 ${groupIndex > 0 ? 'border-l border-[#b0c4d8]' : ''}`}
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
                        flex flex-col items-center justify-center px-2 py-1 min-w-[52px] h-[54px] rounded
                        transition-all duration-100
                        ${isActive
                          ? 'bg-gradient-to-b from-[#ffefc8] to-[#ffe8a0] border border-[#d4a800] shadow-sm'
                          : isHovered
                            ? 'bg-gradient-to-b from-white/60 to-white/30 border border-[#c0d0e4]'
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
                        text-[10px] leading-tight text-center whitespace-pre-line mt-0.5
                        ${isActive ? 'text-amber-800 font-medium' : 'text-slate-700'}
                      `}>
                        {module.label}
                      </span>
                    </button>
                  );
                })}
            </div>
          ))}

          {/* Spacer */}
          <div className="flex-1 flex items-center justify-end border-l border-[#b0c4d8] px-3">
              <button
                onClick={openSearch}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/50 border border-[#b0c4d8] hover:bg-white/80 transition-all cursor-pointer group"
              >
                <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700 transition-colors" />
                <span className="text-[11px] text-slate-500 group-hover:text-slate-600 transition-colors w-48">Search...</span>
                <div className="flex items-center gap-0.5 ml-2">
                  <kbd className="h-[16px] min-w-[16px] flex items-center justify-center text-[8px] font-mono bg-white border border-[#b0c4d8] rounded text-slate-400">
                    <Command className="w-2.5 h-2.5" />
                  </kbd>
                  <kbd className="h-[16px] min-w-[16px] flex items-center justify-center text-[8px] font-mono bg-white border border-[#b0c4d8] rounded text-slate-400">F</kbd>
                </div>
              </button>
          </div>

          {/* Org Switcher */}
          {selectedOrg && (
            <div className="flex items-center px-2 border-l border-[#b0c4d8]">
              <button
                onClick={() => setShowOrgSelector(true)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/40 transition-colors group"
                title="Switch Organization"
              >
                {selectedOrg.logoUrl ? (
                  <img src={selectedOrg.logoUrl} alt="" className="w-5 h-5 rounded object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
                    {(selectedOrg.orgName || 'O').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] font-medium text-slate-700 max-w-[100px] truncate hidden sm:block">
                  {selectedOrg.orgName || selectedOrg.alias}
                </span>
                {organizationsUser.length > 1 && (
                  <ArrowRightLeft className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
                )}
              </button>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center px-3">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-700 hidden sm:block">{user?.name || 'User'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                        <div className="text-xs text-slate-500">{user?.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f4f8]">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.main>
      </div>

      <CommandSearch
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onSelect={handleSearchSelect}
      />

      <Notifications />

      {showOrgSelector && (
        <OrgSelectorModal
          organizations={organizationsUser}
          isOverlay
          onClose={() => setShowOrgSelector(false)}
          onSelect={(org) => {
            setSelectedOrg(org);
            setShowOrgSelector(false);
          }}
        />
      )}
    </div>
  );
};

export default MainLayout;
