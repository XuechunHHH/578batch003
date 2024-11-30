/**
 * Format a number as currency
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };
  
  /**
   * Format a number with appropriate suffixes (K, M, B, T)
   * @param value Number to format
   * @returns Formatted number string
   */
  export const formatNumber = (value: number): string => {
    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toLocaleString();
  };
  
  /**
   * Format a percentage value
   * @param value Percentage value
   * @returns Formatted percentage string
   */
  export const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };