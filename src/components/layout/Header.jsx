import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, HelpCircle, User, Command } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const moduleNames = {
  company: 'Company',
  account: 'Account Master',
  salesman: 'Salesman Master',
  pricelist: 'Price List',
  product: 'Product Master',
  quotation: 'Quotation Management',
  user: 'User Management',
  backup: 'Backup & Restore',
  settings: 'Settings'
};

const spring = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const Header = () => {
  const { activeModule, globalSearchQuery, setGlobalSearchQuery } = useUIStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-surface-800/80 backdrop-blur-xl border-b border-surface-600/50
                       flex items-center justify-between px-6 relative z-30
                       shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-primary to-accent-secondary
                       shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            {moduleNames[activeModule] || 'Dashboard'}
          </h1>
        </div>
      </motion.div>

      <div className="flex items-center gap-3 relative z-10">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            animate={isSearchFocused ? { scale: 1.02 } : { scale: 1 }}
            transition={spring}
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted
                              transition-colors duration-200"
              style={{ color: isSearchFocused ? 'rgb(16, 185, 129)' : undefined }}
            />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search anything..."
              className="w-72 pl-10 pr-16 py-2.5 bg-surface-700/50 border border-surface-500/50 rounded-xl
                        text-sm text-text-primary placeholder:text-text-muted
                        focus:outline-none focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/20
                        focus:bg-surface-700 transition-all duration-200
                        backdrop-blur-sm shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-text-muted
                            bg-surface-600 rounded border border-surface-500
                            shadow-sm">
                <Command className="w-2.5 h-2.5 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-text-muted
                            bg-surface-600 rounded border border-surface-500
                            shadow-sm">
                K
              </kbd>
            </div>
          </motion.div>

          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full mt-2 left-0 right-0 bg-surface-700/95 backdrop-blur-xl
                          rounded-xl border border-surface-500/50 shadow-2xl overflow-hidden"
              >
                <div className="p-3 text-xs text-text-muted text-center">
                  Start typing to search across all modules...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary
                      hover:bg-surface-700/50 transition-all duration-200 relative
                      ring-1 ring-transparent hover:ring-surface-500/50"
          >
            <Bell className="w-5 h-5" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-2 right-2 w-2 h-2 bg-accent-danger rounded-full
                        shadow-[0_0_8px_rgba(239,68,68,0.8)] ring-2 ring-surface-800"
            />
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full right-0 mt-2 w-80 bg-surface-700/95 backdrop-blur-xl
                          rounded-xl border border-surface-500/50 shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-surface-600/50">
                  <h3 className="font-semibold text-text-primary">Notifications</h3>
                </div>
                <div className="p-4 text-sm text-text-muted text-center">
                  No new notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary
                    hover:bg-surface-700/50 transition-all duration-200
                    ring-1 ring-transparent hover:ring-surface-500/50"
        >
          <HelpCircle className="w-5 h-5" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 pl-4 ml-2 border-l border-surface-600/50"
        >
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary tracking-tight">Admin User</p>
            <p className="text-xs text-text-muted font-medium">admin@company.com</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary via-accent-primary to-accent-secondary
                      flex items-center justify-center cursor-pointer
                      shadow-lg shadow-accent-primary/25 ring-2 ring-accent-primary/20
                      transition-all duration-200 hover:shadow-accent-primary/40"
          >
            <User className="w-5 h-5 text-surface-900" />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
