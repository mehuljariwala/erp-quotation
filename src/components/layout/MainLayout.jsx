import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  UserCircle,
  Tags,
  Package,
  FileText,
  User,
  HardDrive,
  Settings
} from 'lucide-react';
import { Notifications } from './Notifications';

const toolbarModules = [
  { id: 'company', label: 'Company', icon: Building2, group: 'Company' },
  { id: 'account', label: 'Account', icon: Users, group: 'Account' },
  { id: 'salesman', label: 'Salesman', icon: UserCircle, group: 'Account' },
  { id: 'pricelist', label: 'Price List', icon: Tags, group: 'Product' },
  { id: 'product', label: 'Product', icon: Package, group: 'Product' },
  { id: 'quotation', label: 'Quotation', icon: FileText, group: 'Transaction' },
  { id: 'user', label: 'User', icon: User, group: 'Utility' },
  { id: 'backup', label: 'Backup', icon: HardDrive, group: 'Utility' },
  { id: 'setting', label: 'Setting', icon: Settings, group: 'Utility' },
];

export const MainLayout = ({ children, activeModule, onModuleChange }) => {
  const [hoveredModule, setHoveredModule] = useState(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Toolbar - Classic Windows Style */}
      <div className="bg-gradient-to-b from-[#d4e4f7] to-[#c4d8ef] border-b border-[#a0b8d0] px-2 py-1">
        <div className="flex items-end gap-1">
          {toolbarModules.map((module) => {
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
                  toolbar-btn flex flex-col items-center px-3 py-1 min-w-[60px]
                  ${isActive ? 'active' : ''}
                `}
              >
                <Icon
                  className={`w-7 h-7 mb-0.5 ${isActive ? 'text-accent-primary' : 'text-text-secondary'}`}
                  strokeWidth={1.5}
                />
                <span className="text-[11px] font-medium">{module.label}</span>
              </button>
            );
          })}
        </div>

        {/* Module group labels */}
        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-text-muted px-1">
          <span className="w-[60px] text-center">Company</span>
          <span className="w-[130px] text-center border-l border-[#b0c4d8] pl-2">Account</span>
          <span className="w-[130px] text-center border-l border-[#b0c4d8] pl-2">Product</span>
          <span className="w-[60px] text-center border-l border-[#b0c4d8] pl-2">Transaction</span>
          <span className="flex-1 text-center border-l border-[#b0c4d8] pl-2">Utility</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-[#e0e8f0] border-b border-[#a0b8d0] px-2 flex items-end">
        <button className="tab-btn">Quotation List</button>
        <button className="tab-btn active">Add Quotation</button>
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
