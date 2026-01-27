import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const QuotationSummary = ({ totals }) => {
  const summaryItems = [
    { label: 'Total Items', value: formatNumber(totals.itemCount), isHighlight: false },
    { label: 'Gross Amount', value: formatCurrency(totals.grossAmount), isHighlight: false },
    { label: 'Discount', value: `- ${formatCurrency(totals.discountAmount)}`, isHighlight: false, isNegative: true },
    { label: 'Taxable Amount', value: formatCurrency(totals.taxableAmount), isHighlight: false },
    { label: 'GST Amount', value: formatCurrency(totals.gstAmount), isHighlight: false },
    { label: 'Net Amount', value: formatCurrency(totals.netAmount), isHighlight: true }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 bg-surface-800 rounded-xl border border-surface-600 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-surface-700 border-b border-surface-600">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
          Summary
        </h3>
      </div>

      {/* Items */}
      <div className="divide-y divide-surface-700">
        {summaryItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center justify-between px-4 py-3
              ${item.isHighlight
                ? 'bg-accent-primary/10 border-t-2 border-accent-primary'
                : ''
              }
            `}
          >
            <span className={`text-sm ${item.isHighlight ? 'font-semibold text-accent-primary' : 'text-text-secondary'}`}>
              {item.label}
            </span>
            <span className={`
              font-mono text-sm font-medium
              ${item.isHighlight
                ? 'text-accent-primary text-lg'
                : item.isNegative
                  ? 'text-accent-success'
                  : 'text-text-primary'
              }
            `}>
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Tax Breakdown */}
      <div className="px-4 py-3 bg-surface-700/50 border-t border-surface-600">
        <div className="flex justify-between text-xs text-text-muted">
          <span>CGST (9%)</span>
          <span className="font-mono">{formatCurrency(totals.gstAmount / 2)}</span>
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>SGST (9%)</span>
          <span className="font-mono">{formatCurrency(totals.gstAmount / 2)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuotationSummary;
