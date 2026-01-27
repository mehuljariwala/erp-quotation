export const sampleQuotations = [
  {
    id: 'Q001',
    vchNo: 1,
    vchDate: '2026-01-25',
    party: { id: 'P001', name: 'Rameshbhai Patel' },
    reference: null,
    remark: 'New villa project',
    email: 'ramesh.patel@email.com',
    salesman: { id: 'S001', name: 'Rajesh Kumar' },
    priceList: 'Dealer',
    lineItems: [
      { id: 'LI001', area: 'Master Bathroom', skuCode: 'TAP-001', product: { id: 'PRD001', name: 'Premium Wall Mixer' }, description: 'Chrome finish wall mixer', mrp: 3150, qty: 2, grossAmount: 6300, discPercent: 5, discAmount: 315, taxableAmount: 5985, gstPercent: 18, gstAmount: 1077.30, netAmount: 7062.30 },
      { id: 'LI002', area: 'Master Bathroom', skuCode: 'SHW-001', product: { id: 'PRD005', name: 'Rain Shower Head 8"' }, description: '8 inch round rain shower head SS304', mrp: 1960, qty: 1, grossAmount: 1960, discPercent: 0, discAmount: 0, taxableAmount: 1960, gstPercent: 18, gstAmount: 352.80, netAmount: 2312.80 },
      { id: 'LI003', area: 'Guest Bathroom', skuCode: 'TAP-002', product: { id: 'PRD002', name: 'Single Lever Basin Mixer' }, description: 'Modern single lever basin mixer', mrp: 2240, qty: 1, grossAmount: 2240, discPercent: 0, discAmount: 0, taxableAmount: 2240, gstPercent: 18, gstAmount: 403.20, netAmount: 2643.20 }
    ],
    totals: { itemCount: 3, grossAmount: 10500, discountAmount: 315, taxableAmount: 10185, gstAmount: 1833.30, netAmount: 12018.30 },
    status: 'draft',
    createdAt: '2026-01-25T10:30:00Z'
  },
  {
    id: 'Q002',
    vchNo: 2,
    vchDate: '2026-01-26',
    party: { id: 'P002', name: 'AR Traders - Rajubhai' },
    reference: null,
    remark: 'Stock order',
    email: 'artraders@email.com',
    salesman: { id: 'S002', name: 'Amit Shah' },
    priceList: 'Wholesale',
    lineItems: [
      { id: 'LI004', area: '', skuCode: 'TAP-003', product: { id: 'PRD003', name: 'Pillar Cock - Chrome' }, description: 'Standard pillar cock', mrp: 680, qty: 20, grossAmount: 13600, discPercent: 2, discAmount: 272, taxableAmount: 13328, gstPercent: 18, gstAmount: 2399.04, netAmount: 15727.04 },
      { id: 'LI005', area: '', skuCode: 'TAP-004', product: { id: 'PRD004', name: 'Angle Valve - Heavy' }, description: 'Heavy duty angle valve', mrp: 520, qty: 50, grossAmount: 26000, discPercent: 3, discAmount: 780, taxableAmount: 25220, gstPercent: 18, gstAmount: 4539.60, netAmount: 29759.60 }
    ],
    totals: { itemCount: 2, grossAmount: 39600, discountAmount: 1052, taxableAmount: 38548, gstAmount: 6938.64, netAmount: 45486.64 },
    status: 'sent',
    createdAt: '2026-01-26T14:15:00Z'
  }
];

export default sampleQuotations;
