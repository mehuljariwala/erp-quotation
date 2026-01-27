export const calculateLineItemAmounts = (mrp, qty, discPercent, gstPercent) => {
  const grossAmount = mrp * qty;
  const discAmount = (grossAmount * discPercent) / 100;
  const taxableAmount = grossAmount - discAmount;
  const gstAmount = (taxableAmount * gstPercent) / 100;
  const netAmount = taxableAmount + gstAmount;

  return {
    grossAmount: round(grossAmount),
    discAmount: round(discAmount),
    taxableAmount: round(taxableAmount),
    gstAmount: round(gstAmount),
    netAmount: round(netAmount)
  };
};

export const calculateQuotationTotals = (lineItems) => {
  return {
    itemCount: lineItems.length,
    totalQty: lineItems.reduce((sum, item) => sum + (item.qty || 0), 0),
    grossAmount: round(lineItems.reduce((sum, item) => sum + (item.grossAmount || 0), 0)),
    discountAmount: round(lineItems.reduce((sum, item) => sum + (item.discAmount || 0), 0)),
    taxableAmount: round(lineItems.reduce((sum, item) => sum + (item.taxableAmount || 0), 0)),
    gstAmount: round(lineItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0)),
    netAmount: round(lineItems.reduce((sum, item) => sum + (item.netAmount || 0), 0))
  };
};

export const round = (value, decimals = 2) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const getGSTBreakup = (lineItems) => {
  const gstRates = {};

  lineItems.forEach(item => {
    const rate = item.gstPercent || 0;
    if (!gstRates[rate]) {
      gstRates[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    }
    gstRates[rate].taxable += item.taxableAmount || 0;
    gstRates[rate].cgst += (item.gstAmount || 0) / 2;
    gstRates[rate].sgst += (item.gstAmount || 0) / 2;
    gstRates[rate].total += item.gstAmount || 0;
  });

  Object.keys(gstRates).forEach(rate => {
    gstRates[rate].taxable = round(gstRates[rate].taxable);
    gstRates[rate].cgst = round(gstRates[rate].cgst);
    gstRates[rate].sgst = round(gstRates[rate].sgst);
    gstRates[rate].total = round(gstRates[rate].total);
  });

  return gstRates;
};

export const getPriceByList = (product, priceListName) => {
  if (!product || !product.prices) return 0;
  return product.prices[priceListName] || product.prices.MRP || 0;
};
