import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const CenterSearchModal = ({ isOpen, onClose, onOpen, onSearch, placeholder = 'Type to search...' }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (value) => {
    setQuery(value);
    onSearch(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl mx-4 animate-in">
        <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-200/80 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-base text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={() => handleChange('')}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          <div className="border-t border-slate-100 px-5 py-2">
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">ESC</kbd>
              to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterSearchModal;
