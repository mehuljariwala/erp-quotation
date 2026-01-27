export const priceLists = [
  { id: 'PL001', name: 'MRP', code: 'MRP', description: 'Maximum Retail Price', discountPercent: 0 },
  { id: 'PL002', name: 'Wholesale', code: 'WHL', description: 'Wholesale Price (20% off MRP)', discountPercent: 20 },
  { id: 'PL003', name: 'Dealer', code: 'DLR', description: 'Dealer Price (30% off MRP)', discountPercent: 30 },
  { id: 'PL004', name: 'Contractor', code: 'CTR', description: 'Contractor Price (25% off MRP)', discountPercent: 25 },
  { id: 'PL005', name: 'Project', code: 'PRJ', description: 'Project Special Price (35% off MRP)', discountPercent: 35 }
];

export default priceLists;
