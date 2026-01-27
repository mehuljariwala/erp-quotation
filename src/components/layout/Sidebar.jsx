import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, UserCog, Tags, Package, FileText,
  Shield, Database, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const menuItems = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'account', label: 'Account', icon: Users },
  { id: 'salesman', label: 'Salesman', icon: UserCog },
  { id: 'pricelist', label: 'Price List', icon: Tags },
  { id: 'product', label: 'Product', icon: Package },
  { id: 'quotation', label: 'Quotation', icon: FileText },
  { id: 'user', label: 'User', icon: Shield },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const spring = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const Sidebar = () => {
  const { activeModule, setActiveModule, isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 64 : 240 }}
      transition={spring}
      className="h-screen bg-gradient-to-b from-surface-800 via-surface-800 to-surface-900
                 border-r border-surface-600/50 flex flex-col relative backdrop-blur-xl
                 shadow-[4px_0_24px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none" />

      <div className="h-16 flex items-center justify-center border-b border-surface-600/50 px-4 relative z-10">
        <motion.div
          layout
          transition={spring}
          className="flex items-center gap-3"
        >
          {isSidebarCollapsed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary via-accent-primary to-accent-secondary
                         flex items-center justify-center shadow-lg shadow-accent-primary/25
                         ring-1 ring-accent-primary/30"
            >
              <span className="text-surface-900 font-bold text-base tracking-tight">Q</span>
            </motion.div>
          ) : (
            <>
              <motion.div
                layoutId="logo"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary via-accent-primary to-accent-secondary
                           flex items-center justify-center shadow-lg shadow-accent-primary/25
                           ring-1 ring-accent-primary/30"
              >
                <span className="text-surface-900 font-bold text-base tracking-tight">Q</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-semibold text-text-primary tracking-tight text-base">QuotePro</span>
                <span className="text-[10px] text-accent-primary/80 font-medium tracking-wider uppercase">Enterprise</span>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-surface-600 scrollbar-track-transparent">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-3.5 py-3 rounded-xl
                transition-all duration-200 group relative overflow-hidden
                ${isActive
                  ? 'bg-gradient-to-r from-accent-primary/15 to-accent-secondary/10 text-accent-primary shadow-lg shadow-accent-primary/10 ring-1 ring-accent-primary/30'
                  : 'text-text-secondary hover:bg-surface-700/50 hover:text-text-primary'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBackground"
                  className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-accent-primary/5 to-transparent"
                  transition={spring}
                />
              )}

              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-all duration-200
                    ${isActive ? 'text-accent-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'group-hover:scale-110'}
                  `}
                />
              </motion.div>

              {!isSidebarCollapsed && (
                <motion.span
                  className="text-sm font-medium truncate relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-primary
                           shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  transition={spring}
                />
              )}

              {isActive && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-primary to-accent-secondary rounded-r-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -right-3 top-24 w-7 h-7 bg-surface-700 border border-surface-500
                   rounded-full flex items-center justify-center text-text-muted
                   hover:text-accent-primary hover:bg-surface-600 hover:border-accent-primary/50
                   transition-all duration-200 shadow-lg hover:shadow-accent-primary/20 z-20
                   ring-1 ring-surface-600/50 hover:ring-accent-primary/30"
      >
        <motion.div
          animate={{ rotate: isSidebarCollapsed ? 0 : 180 }}
          transition={spring}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {!isSidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4 border-t border-surface-600/50 relative z-10 bg-surface-900/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <p className="text-xs text-text-muted font-medium">System Online</p>
          </div>
          <p className="text-[10px] text-text-muted/60 font-mono">v1.0.0-POC</p>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
