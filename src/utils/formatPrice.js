/**
 * Format a number as a price string
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: 'USD')
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD', locale = 'en-US') => {
  // Handle null, undefined, or invalid values
  if (price === null || price === undefined || isNaN(price)) {
    return '$0.00';
  }

  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Handle invalid numbers
  if (isNaN(numPrice)) {
    return '$0.00';
  }

  try {
    // Use Intl.NumberFormat for proper currency formatting
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  } catch (error) {
    // Fallback to basic formatting if Intl.NumberFormat fails
    console.warn('Error formatting price:', error);
    return `$${numPrice.toFixed(2)}`;
  }
};

/**
 * Format a number as a price string without currency symbol
 * @param {number} price - The price to format
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted price string without currency symbol
 */
export const formatPriceWithoutSymbol = (price, locale = 'en-US') => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0.00';
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '0.00';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  } catch (error) {
    console.warn('Error formatting price:', error);
    return numPrice.toFixed(2);
  }
};

/**
 * Format a compact price (e.g., $1.2K, $5.6M)
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: 'USD')
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted compact price string
 */
export const formatCompactPrice = (price, currency = 'USD', locale = 'en-US') => {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0';
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '$0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(numPrice);
  } catch (error) {
    console.warn('Error formatting compact price:', error);
    
    // Fallback manual compact formatting
    if (numPrice >= 1000000) {
      return `$${(numPrice / 1000000).toFixed(1)}M`;
    } else if (numPrice >= 1000) {
      return `$${(numPrice / 1000).toFixed(1)}K`;
    } else {
      return `$${numPrice.toFixed(0)}`;
    }
  }
};

/**
 * Parse a price string to a number
 * @param {string} priceString - The price string to parse
 * @returns {number} The parsed price as a number
 */
export const parsePrice = (priceString) => {
  if (typeof priceString !== 'string') {
    return typeof priceString === 'number' ? priceString : 0;
  }

  // Remove currency symbols, spaces, and commas
  const cleaned = priceString.replace(/[$,\s]/g, '');
  
  // Parse the cleaned string
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate tax amount
 * @param {number} subtotal - The subtotal amount
 * @param {number} taxRate - The tax rate (e.g., 0.08 for 8%)
 * @returns {number} The calculated tax amount
 */
export const calculateTax = (subtotal, taxRate) => {
  if (isNaN(subtotal) || isNaN(taxRate)) {
    return 0;
  }
  
  return subtotal * taxRate;
};

/**
 * Calculate discount amount
 * @param {number} amount - The original amount
 * @param {number} discountPercent - The discount percentage (e.g., 10 for 10%)
 * @returns {number} The calculated discount amount
 */
export const calculateDiscount = (amount, discountPercent) => {
  if (isNaN(amount) || isNaN(discountPercent)) {
    return 0;
  }
  
  return amount * (discountPercent / 100);
};

/**
 * Format a discount percentage
 * @param {number} percent - The percentage to format
 * @returns {string} Formatted percentage string
 */
export const formatDiscount = (percent) => {
  if (isNaN(percent)) {
    return '0%';
  }
  
  return `${percent.toFixed(0)}%`;
};

// Export default for backwards compatibility
export default formatPrice;