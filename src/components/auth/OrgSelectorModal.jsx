import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, ChevronRight } from 'lucide-react';

export const OrgSelectorModal = ({ organizations = [], onSelect, onClose, isOverlay = false }) => {
  useEffect(() => {
    if (organizations.length === 1 && !isOverlay) {
      onSelect(organizations[0]);
    }
  }, [organizations, onSelect, isOverlay]);

  useEffect(() => {
    if (!isOverlay) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOverlay, onClose]);

  if (organizations.length === 1 && !isOverlay) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOverlay ? 'bg-black/40 backdrop-blur-sm' : 'bg-gradient-to-br from-slate-100 to-blue-50'}`}>
        {isOverlay && onClose && (
          <div className="absolute inset-0" onClick={onClose} />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg mx-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Select Organization</h2>
                  <p className="text-sm text-slate-500">Choose an organization to continue</p>
                </div>
              </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {organizations.map((org) => (
                  <motion.button
                    key={org.unId || org.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelect(org)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
                  >
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.orgName}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {(org.orgName || org.alias || 'O').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                        {org.orgName || org.alias || 'Organization'}
                      </div>
                      {org.alias && org.alias !== org.orgName && (
                        <div className="text-xs text-slate-500 truncate mt-0.5">{org.alias}</div>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrgSelectorModal;
