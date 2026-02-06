import { useRef } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { useQuotationStore } from '../../stores/quotationStore';
import { formatCurrency } from '../../utils/formatters';

export const PrintVoucherModal = ({ isOpen, onClose }) => {
  const { currentQuotation } = useQuotationStore();
  const printRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation #${String(q.vchNo).padStart(4, '0')}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 32px; color: #1e293b; font-size: 13px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
            .title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }
            .vch-no { font-size: 14px; color: #64748b; margin-top: 4px; }
            .date-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
            .date-value { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
            .info-box { padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; }
            .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 3px; }
            .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
            .remark-box { margin-bottom: 20px; padding: 10px 14px; background: #fffbeb; border-radius: 6px; border: 1px solid #fef3c7; color: #92400e; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
            th.text-right { text-align: right; }
            td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
            td.text-right { text-align: right; }
            .desc-cell { font-weight: 500; }
            .totals-wrap { display: flex; justify-content: flex-end; }
            .totals { min-width: 280px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row .label { color: #64748b; }
            .total-row .value { font-weight: 500; }
            .total-row.discount .value { color: #ef4444; }
            .total-row.net { font-size: 16px; font-weight: 800; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 6px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const q = currentQuotation;
  const totals = q.totals;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Print Voucher</h2>
              <p className="text-xs text-slate-500">Quotation #{String(q.vchNo).padStart(4, '0')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div ref={printRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 16, borderBottom: '2px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>QUOTATION</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>#{String(q.vchNo).padStart(4, '0')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{q.vchDate}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 3 }}>Party</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{q.party?.name || 'N/A'}</div>
              </div>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 3 }}>Reference</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{q.reference?.name || 'N/A'}</div>
              </div>
            </div>

            {q.salesman && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 3 }}>Salesman</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{q.salesman?.name || 'N/A'}</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 3 }}>Price List</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{q.priceList || 'MRP'}</div>
                </div>
              </div>
            )}

            {q.remark && (
              <div style={{ marginBottom: 20, padding: '10px 14px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fef3c7', color: '#92400e', fontSize: 13 }}>
                <strong>Remark:</strong> {q.remark}
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr>
                  {['#', 'Description', 'SKU', 'MRP', 'Qty', 'Disc%', 'GST%', 'Net Amt'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 12px',
                      textAlign: i >= 3 ? 'right' : 'left',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#64748b',
                      background: '#f8fafc',
                      borderBottom: '2px solid #e2e8f0'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.lineItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontWeight: 500 }}>{item.description || item.skuCode}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>{item.skuCode}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13, textAlign: 'right' }}>{item.mrp?.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13, textAlign: 'right' }}>{item.qty}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13, textAlign: 'right' }}>{item.discPercent}%</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13, textAlign: 'right' }}>{item.gstPercent}%</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{item.netAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Gross Amount</span>
                  <span style={{ fontWeight: 500 }}>{totals.grossAmount?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Discount</span>
                  <span style={{ fontWeight: 500, color: '#ef4444' }}>-{totals.discountAmount?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Taxable Amount</span>
                  <span style={{ fontWeight: 500 }}>{totals.taxableAmount?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>GST</span>
                  <span style={{ fontWeight: 500 }}>{totals.gstAmount?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 5px', fontSize: 16, fontWeight: 800, borderTop: '2px solid #0f172a', marginTop: 6 }}>
                  <span>Net Total</span>
                  <span>{formatCurrency(totals.netAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintVoucherModal;
