import { useState } from 'react';
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
  LayoutDashboard
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
      { id: 'salesman', label: 'Salesman', icon: UserCircle },
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
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Ribbon Toolbar */}
      <div className="bg-gradient-to-b from-[#d8e6f3] to-[#c8dcea] border-b border-[#9cb8d4]">
        <div className="flex items-stretch">
          {toolbarGroups.map((group, groupIndex) => (
            <div
              key={group.id}
              className="flex flex-col"
            >
              {/* Module buttons */}
              <div className={`flex items-end h-[60px] px-2 gap-1 ${groupIndex > 0 ? 'border-l border-[#b0c4d8]' : ''}`}>
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

              {/* Group label */}
              <div className={`bg-gradient-to-b from-[#c4d8ec] to-[#b8cce0] border-t border-[#a8bcd4] px-2 py-0.5 text-center ${groupIndex > 0 ? 'border-l border-[#b0c4d8]' : ''}`}>
                <span className="text-[10px] text-slate-600">{group.label}</span>
              </div>
            </div>
          ))}

          {/* Spacer */}
          <div className="flex-1 flex flex-col border-l border-[#b0c4d8]">
            <div className="flex-1 h-[60px]" />
            <div className="bg-gradient-to-b from-[#c4d8ec] to-[#b8cce0] border-t border-[#a8bcd4] h-[19px]" />
          </div>

          {/* User Menu */}
          <div className="flex flex-col">
            <div className="flex-1 h-[60px] flex items-center px-3">
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
            <div className="bg-gradient-to-b from-[#c4d8ec] to-[#b8cce0] border-t border-[#a8bcd4] h-[19px]" />
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

      <Notifications />
    </div>
  );
};

export default MainLayout;
