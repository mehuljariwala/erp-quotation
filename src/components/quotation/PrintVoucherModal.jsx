import { useState, useEffect, useCallback } from 'react';
import { Printer, Eye, PenTool } from 'lucide-react';
import { useQuotationStore } from '../../stores/quotationStore';
import { useAuthStore } from '../../stores/authStore';

const REPORT_TEMPLATES = [
  { reportName: 'Quatation', fileName: 'Quatation' },
  { reportName: 'MRP', fileName: 'MRP' },
  { reportName: 'Discount', fileName: 'Discount' },
  { reportName: 'Plumber', fileName: 'Plumber' },
  { reportName: 'QuatationDet', fileName: 'QuatationDetails' },
  { reportName: 'Quatation Pending', fileName: 'QuatationPending' },
  { reportName: 'Without SKUCode', fileName: 'Basic' },
  { reportName: 'With GST', fileName: 'QuatationWithGST' },
];

const TEMPLATE_COLUMNS = {
  Quatation:        ['sr', 'sku', 'image', 'name', 'mrp', 'qty', 'total', 'netAmt'],
  MRP:              ['sr', 'sku', 'image', 'name', 'mrp', 'qty', 'total', 'remark'],
  Discount:         ['sr', 'sku', 'image', 'name', 'mrp', 'qty', 'total', 'disc', 'netAmt'],
  Plumber:          ['sr', 'sku', 'name', 'image', 'qty', 'remark'],
  QuatationDetails: ['sr', 'sku', 'image', 'name', 'mrp', 'qty', 'total', 'disc', 'gst', 'netAmt'],
  QuatationPending: ['sr', 'sku', 'image', 'name', 'mrp', 'qty', 'total', 'netAmt'],
  Basic:            ['sr', 'image', 'name', 'mrp', 'qty', 'total', 'disc', 'gst', 'netAmt'],
  QuatationWithGST: ['sr', 'sku', 'name', 'image', 'mrp', 'qty', 'total', 'disc', 'gst', 'netAmt'],
};

const COL_DEFS = {
  sr:      { label: 'Sr.',          align: 'center' },
  sku:     { label: 'SKU Code',     align: 'left' },
  image:   { label: 'Image',        align: 'center' },
  name:    { label: 'Name',         align: 'left' },
  mrp:     { label: 'MRP',          align: 'right' },
  qty:     { label: 'Qty',          align: 'right' },
  total:   { label: 'Total',        align: 'right' },
  disc:    { label: 'Disc(%)',      align: 'right' },
  gst:     { label: 'GST(%)',       align: 'right' },
  netAmt:  { label: 'Net Amt.',     align: 'right' },
  remark:  { label: 'Remark',       align: 'left' },
};

const fmt = (v) => {
  if (v == null || isNaN(v)) return '0.00';
  return Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtQty = (v) => {
  if (v == null || isNaN(v)) return '0.00';
  return Number(v).toFixed(2);
};

const fmtDate = (d) => {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return d;
};

const groupByArea = (items) => {
  const map = {};
  items.forEach(item => {
    const key = item.area || 'General';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return Object.entries(map).map(([area, items]) => ({
    area,
    items,
    totalQty: items.reduce((s, i) => s + (i.qty || 0), 0),
    grossAmount: items.reduce((s, i) => s + (i.grossAmount || 0), 0),
    netAmount: items.reduce((s, i) => s + (i.netAmount || 0), 0),
  }));
};

const cellValue = (item, col, idx) => {
  switch (col) {
    case 'sr':     return idx + 1;
    case 'sku':    return item.skuCode || '';
    case 'image':  return item.image
      ? `<img src="${item.image}" style="width:50px;height:50px;object-fit:cover;" onerror="this.style.display='none'" />`
      : '';
    case 'name':   return `<b>${item.description || item.product?.name || ''}</b>`;
    case 'mrp':    return fmt(item.mrp);
    case 'qty':    return fmtQty(item.qty);
    case 'total':  return fmt(item.grossAmount);
    case 'disc':   return fmtQty(item.discPercent || 0);
    case 'gst':    return fmtQty(item.gstPercent || 0);
    case 'netAmt': return fmt(item.netAmount);
    case 'remark': return '';
    default:       return '';
  }
};

const buildPrintHTML = (q, totals, templateKey, orgName) => {
  const cols = TEMPLATE_COLUMNS[templateKey] || TEMPLATE_COLUMNS.Quatation;
  const groups = groupByArea(q.lineItems);
  const isPlumber = templateKey === 'Plumber';
  const isMRP = templateKey === 'MRP';
  const hasPricing = !isPlumber;

  const grandNetAmt = totals.netAmount || groups.reduce((s, g) => s + g.netAmount, 0);
  const grandGrossAmt = totals.grossAmount || groups.reduce((s, g) => s + g.grossAmount, 0);
  const grandQty = groups.reduce((s, g) => s + g.totalQty, 0);
  const grandItemCount = totals.totalItems || q.lineItems.length;

  const thBase = `padding:6px 8px;border:1px solid #000;font-size:10px;font-weight:700;white-space:nowrap;`;
  const thStyle = isPlumber
    ? `${thBase}background:#000;color:#fff;`
    : `${thBase}background:#fff;color:#000;`;

  const headerCells = cols.map(c =>
    `<th style="${thStyle}text-align:${COL_DEFS[c].align};">${COL_DEFS[c].label}</th>`
  ).join('');

  const areaSummary = hasPricing ? `
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      <thead>
        <tr>
          <th style="${thBase}background:#fff;color:#000;text-align:center;width:8%;">Sr.</th>
          <th style="${thBase}background:#fff;color:#000;text-align:left;">Area</th>
          <th style="${thBase}background:#fff;color:#000;text-align:right;width:22%;">Net Amt.</th>
        </tr>
      </thead>
      <tbody>
        ${groups.map((g, i) => `
          <tr>
            <td style="padding:5px 8px;border:1px solid #000;text-align:center;font-size:11px;">${i + 1}</td>
            <td style="padding:5px 8px;border:1px solid #000;font-size:11px;font-weight:700;">${g.area}</td>
            <td style="padding:5px 8px;border:1px solid #000;text-align:right;font-size:11px;">${fmt(g.netAmount)}</td>
          </tr>
        `).join('')}
        <tr>
          <td style="padding:6px 8px;border:1px solid #000;"></td>
          <td style="padding:6px 8px;border:1px solid #000;font-weight:800;font-size:11px;">TOTAL :</td>
          <td style="padding:6px 8px;border:1px solid #000;text-align:right;font-weight:800;font-size:11px;">${fmt(grandNetAmt)}</td>
        </tr>
      </tbody>
    </table>` : '';

  const areaDetails = groups.map(g => {
    const rows = g.items.map((item, i) => {
      const cells = cols.map(c => {
        const a = COL_DEFS[c].align;
        return `<td style="padding:5px 6px;border:1px solid #000;font-size:10px;text-align:${a};vertical-align:middle;">${cellValue(item, c, i)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const subColor = isPlumber ? 'color:#0000CD;' : '';
    const subBg = isPlumber ? '' : 'background:#FFFACD;';

    const subCells = cols.map(c => {
      const base = `padding:5px 6px;border:1px solid #000;font-size:10px;font-weight:700;${subBg}${subColor}`;
      if (c === 'sr') return `<td style="${base}text-align:center;">${g.items.length}</td>`;
      if (c === 'image') return `<td style="${base}"></td>`;
      if (c === 'name') return `<td style="${base}"></td>`;
      if (c === 'sku') return `<td style="${base}"></td>`;
      if (c === 'mrp') return `<td style="${base}"></td>`;
      if (c === 'disc') return `<td style="${base}"></td>`;
      if (c === 'gst') return `<td style="${base}"></td>`;
      if (c === 'qty') return `<td style="${base}text-align:right;">${fmtQty(g.totalQty)}</td>`;
      if (c === 'total') return `<td style="${base}text-align:right;">${fmt(g.grossAmount)}</td>`;
      if (c === 'netAmt') return `<td style="${base}text-align:right;">${fmt(g.netAmount)}</td>`;
      if (c === 'remark' && isMRP) return `<td style="${base}text-align:right;">${fmt(g.netAmount)}</td>`;
      if (c === 'remark' && isPlumber) return `<td style="${base}"></td>`;
      return `<td style="${base}"></td>`;
    }).join('');

    return `
      <div style="margin:14px 0;">
        <div style="padding:6px 12px;border:2px dashed #003399;color:#003399;font-weight:700;font-size:12px;margin-bottom:4px;">
          ${g.area}
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>${headerCells}</tr></thead>
          <tbody>
            ${rows}
            <tr>${subCells}</tr>
          </tbody>
        </table>
      </div>`;
  }).join('');

  const grandColor = isPlumber ? 'color:#0000CD;' : '';
  const grandBg = isPlumber ? '' : '';
  const grandTotalCells = cols.map(c => {
    const base = `padding:6px 8px;border:1px solid #000;font-weight:700;font-size:11px;${grandColor}${grandBg}`;
    if (c === 'sr') return `<td style="${base}text-align:center;">${grandItemCount}</td>`;
    if (c === 'qty') return `<td style="${base}text-align:right;">${fmtQty(grandQty)}</td>`;
    if (c === 'total') return `<td style="${base}text-align:right;">${fmt(grandGrossAmt)}</td>`;
    if (c === 'netAmt') return `<td style="${base}text-align:right;">${fmt(grandNetAmt)}</td>`;
    if (c === 'remark' && isMRP) return `<td style="${base}text-align:right;">${fmt(grandNetAmt)}</td>`;
    return `<td style="${base}"></td>`;
  }).join('');

  const grandTotalRow = `
    <table style="width:100%;border-collapse:collapse;margin-top:14px;">
      <thead><tr>${headerCells}</tr></thead>
      <tbody><tr>${grandTotalCells}</tr></tbody>
    </table>`;

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8" />
<title>Quotation #${String(q.vchNo).padStart(4, '0')}</title>
<style>
  @page { size: A4 portrait; margin: 14mm 16mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; font-size: 11px; padding: 20px; }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head><body>

<!-- Header -->
<div style="text-align:center;">
  <div style="color:#FF6633;font-size:12px;font-weight:400;letter-spacing:2px;">|| JOGI DARSHAN ||</div>
  <div style="color:#1a237e;font-size:48px;font-weight:700;line-height:1.1;margin:4px 0;">${orgName || 'COMPANY'}</div>
  <div style="border-top:1px solid #000;margin:6px 0;"></div>
  <div style="font-size:16px;font-weight:700;padding:4px 0;">QUOTATION</div>
  <div style="border-top:1px solid #000;margin:0 0 4px;"></div>
  <div style="font-size:11px;font-weight:700;">${q.party?.city || 'ADDRESS'}</div>
  <div style="font-size:11px;">${q.party?.phone ? 'Phone No : ' + q.party.phone : ''}</div>
  <div style="border-top:2px solid #000;margin:6px 0 4px;"></div>
</div>

<!-- Party Info -->
<table style="width:100%;margin:8px 0;font-size:11px;">
  <tr>
    <td style="vertical-align:top;width:65%;">
      <table style="font-size:11px;line-height:1.8;">
        <tr><td style="padding-right:6px;white-space:nowrap;">Party</td><td style="padding-right:4px;">:</td><td><b>${q.party?.name || 'N/A'}</b></td></tr>
        <tr><td style="padding-right:6px;white-space:nowrap;">Address</td><td style="padding-right:4px;">:</td><td>${q.party?.city || ''}</td></tr>
        <tr><td style="padding-right:6px;white-space:nowrap;">Mobile</td><td style="padding-right:4px;">:</td><td>${q.party?.phone || ''}</td></tr>
        <tr><td style="padding-right:6px;white-space:nowrap;">Refrence :</td><td style="padding-right:4px;"></td><td><b>${q.reference?.name || ''}</b>${q.reference?.phone ? '&nbsp;&nbsp;&nbsp;Mobile : ' + q.reference.phone : ''}</td></tr>
      </table>
    </td>
    <td style="vertical-align:top;text-align:right;">
      <table style="font-size:11px;line-height:1.8;margin-left:auto;">
        <tr><td style="padding-right:6px;">No.</td><td style="padding-right:4px;">:</td><td><b>A-${String(q.vchNo).padStart(5, '0')}</b></td></tr>
        <tr><td style="padding-right:6px;">Date</td><td style="padding-right:4px;">:</td><td><b>${fmtDate(q.vchDate)}</b></td></tr>
      </table>
    </td>
  </tr>
</table>

${q.remark ? `<div style="color:#DC143C;font-weight:700;font-size:11px;margin:4px 0 8px;"><b>Remark : ${q.remark}</b></div>` : ''}

<div style="border-top:1px solid #000;margin:6px 0;"></div>

${areaSummary}
${areaDetails}
${grandTotalRow}

<!-- Terms & Conditions -->
<div style="margin-top:24px;">
  <div style="font-weight:700;font-size:11px;margin-bottom:6px;">TERMS & CONDITIONS FOR BETTER RELATIONS :-</div>
  <div style="color:#DC143C;font-weight:700;font-size:10px;line-height:1.8;">
    1) PAYMENT 100 % ADVANCE.<br/>
    2) FREIGHT AND UNLOADING CHARGES WILL BE EXTRA @ CONCERNED SITE.<br/>
    3) GOODS ONCE SOLD CANNOT BE RETURNED.<br/>
    4) ITEMS ONCE ORDERED CAN NOT BE CANCELLED.<br/>
    5) QUOTATION VALID 10 DAYS FROM QUOTATION DATE.
  </div>
</div>

<!-- Signature -->
<table style="width:100%;margin-top:50px;">
  <tr>
    <td style="width:50%;vertical-align:bottom;padding-top:40px;">
      <div style="border-top:1px solid #000;display:inline-block;min-width:160px;padding-top:6px;font-size:11px;">Receiver Signature</div>
    </td>
    <td style="width:50%;text-align:right;vertical-align:bottom;">
      <div style="display:inline-block;text-align:center;">
        <div style="font-size:12px;margin-bottom:40px;">For, ${orgName || 'COMPANY'}</div>
        <div style="border-top:1px solid #000;padding-top:6px;min-width:160px;font-size:11px;">Authorised Signatory</div>
      </div>
    </td>
  </tr>
</table>

</body></html>`;
};

export const PrintVoucherModal = ({ isOpen, onClose }) => {
  const { currentQuotation } = useQuotationStore();
  const selectedOrg = useAuthStore(state => state.selectedOrg);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setSelectedIndex(0);
  }, [isOpen]);

  const openPrintWindow = useCallback((autoPrint) => {
    const q = currentQuotation;
    const templateKey = REPORT_TEMPLATES[selectedIndex].fileName;
    const orgName = selectedOrg?.orgName || selectedOrg?.name || '';
    const html = buildPrintHTML(q, q.totals, templateKey, orgName);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    if (autoPrint) {
      setTimeout(() => win.print(), 500);
    }
  }, [currentQuotation, selectedIndex, selectedOrg]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, REPORT_TEMPLATES.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        openPrintWindow(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, openPrintWindow]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />

      <div className="modal-dialog relative w-full max-w-[640px] overflow-hidden animate-scale-in">
        <div className="modal-title-bar">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>Voucher Print</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body p-0">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-center text-[15px] font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase">
              Select Proper Report From The List
            </h2>
          </div>

          <div className="mx-4 mb-4 rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--color-header-bg)] border-b border-[var(--color-border)]">
                  <th className="w-8 px-2 py-2.5" />
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-r border-[var(--color-border)]">
                    Report Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    File Name
                  </th>
                </tr>
              </thead>
              <tbody>
                {REPORT_TEMPLATES.map((report, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <tr
                      key={report.fileName}
                      onClick={() => setSelectedIndex(index)}
                      onDoubleClick={() => openPrintWindow(false)}
                      className={`cursor-pointer transition-colors duration-75 ${
                        isSelected
                          ? 'bg-[var(--color-accent-primary)] text-white'
                          : index % 2 === 0
                            ? 'bg-white hover:bg-[var(--color-row-hover)]'
                            : 'bg-[var(--color-surface-800)] hover:bg-[var(--color-row-hover)]'
                      }`}
                    >
                      <td className="w-8 px-2 py-2 text-center">
                        {isSelected && (
                          <span className="text-[11px] font-bold text-white">&#9658;</span>
                        )}
                      </td>
                      <td className={`px-4 py-2 text-[13px] font-medium border-r ${
                        isSelected ? 'border-white/20' : 'border-[var(--color-border)]'
                      }`}>
                        {report.reportName}
                      </td>
                      <td className="px-4 py-2 text-[13px]">
                        {report.fileName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-surface-800)]">
            <button className="action-btn" onClick={() => {}}>
              <PenTool className="w-3.5 h-3.5" />
              Design Report
            </button>

            <div className="flex items-center gap-2">
              <button className="action-btn" onClick={() => openPrintWindow(false)}>
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button className="action-btn primary" onClick={() => openPrintWindow(true)}>
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintVoucherModal;
