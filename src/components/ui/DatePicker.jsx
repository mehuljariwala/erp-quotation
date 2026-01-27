import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

export const DatePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate)
  });

  const firstDayOfMonth = startOfMonth(viewDate).getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  const handleSelect = (date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg
          text-left text-text-primary flex items-center justify-between
          focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30
          transition-colors duration-150 disabled:opacity-50
        `}
      >
        <span className={selectedDate ? '' : 'text-text-muted'}>
          {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-text-muted" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-1 w-72 p-4 bg-surface-700 border border-surface-500
                      rounded-xl shadow-xl"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-1 rounded hover:bg-surface-600 text-text-secondary"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium text-text-primary">
                {format(viewDate, 'MMMM yyyy')}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-1 rounded hover:bg-surface-600 text-text-secondary"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs text-text-muted font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map(day => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrent = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelect(day)}
                    className={`
                      p-2 text-sm rounded-lg text-center transition-colors
                      ${isSelected
                        ? 'bg-accent-primary text-surface-900 font-medium'
                        : isCurrent
                          ? 'bg-surface-600 text-accent-primary font-medium'
                          : 'text-text-primary hover:bg-surface-600'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Today Button */}
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className="w-full mt-3 py-2 text-sm text-accent-primary hover:bg-surface-600
                        rounded-lg transition-colors"
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
