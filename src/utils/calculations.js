// Fallback pricing if options don't have pricing data
export const FALLBACK_PRICING = {
  good: 625,
  better: 770,
  best: 850
};

/**
 * Calculate the price per square based on project size
 * @param {Object} option - The roofing option object
 * @param {number} squares - Number of squares in the project
 * @returns {number} Price per square
 */
export function getPricePerSquare(option, squares) {
  if (!option) return 0;
  
  // Use small job pricing for projects under 16 squares
  if (squares < 16 && option.pricePerSquareUnder16) {
    return option.pricePerSquareUnder16;
  }
  
  // Use standard pricing for projects 16 squares or more
  return option.pricePerSquare || FALLBACK_PRICING[option.type] || 0;
}

/**
 * Calculate total price for a roofing option
 * @param {Object} option - The roofing option object
 * @param {number} squares - Number of squares in the project
 * @returns {number} Total price
 */
export function calculateTotalPrice(option, squares) {
  const pricePerSquare = getPricePerSquare(option, squares);
  return pricePerSquare * squares;
}

/**
 * Calculate monthly payment for loan
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly payment amount
 */
export function calculateMonthlyPayment(principal, annualRate, years) {
  if (annualRate === 0) {
    return principal / (years * 12);
  }
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format currency with cents for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string with cents
 */
export function formatCurrencyWithCents(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
} 