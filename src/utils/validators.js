export const isValidEmail = (email) => {
  if (!email) return true;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return true;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const isValidGST = (gst) => {
  if (!gst) return true;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gst.toUpperCase());
};

export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

export const isInteger = (value) => {
  return Number.isInteger(parseFloat(value));
};

export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateLineItem = (item) => {
  const errors = {};

  if (!item.product) {
    errors.product = 'Product is required';
  }

  if (!isPositiveNumber(item.qty) || item.qty < 1) {
    errors.qty = 'Quantity must be at least 1';
  }

  if (!isInRange(item.discPercent, 0, 100)) {
    errors.discPercent = 'Discount must be between 0 and 100';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateQuotation = (quotation) => {
  const errors = {};

  if (!quotation.party) {
    errors.party = 'Party is required';
  }

  if (quotation.lineItems.length === 0) {
    errors.lineItems = 'At least one item is required';
  }

  if (quotation.email && !isValidEmail(quotation.email)) {
    errors.email = 'Invalid email format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
