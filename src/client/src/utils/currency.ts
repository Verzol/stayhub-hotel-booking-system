/**
 * Currency formatting utilities
 */

/**
 * Format number to VNĐ currency string
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "1,000,000 ₫" or "1,000,000 VND")
 */
export const formatVND = (
  amount: number | null | undefined,
  options?: {
    showSymbol?: boolean;
    symbol?: '₫' | 'VND' | 'đ';
    compact?: boolean; // For short format like 1.5M, 100K
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  if (amount == null || isNaN(amount)) {
    return options?.showSymbol !== false ? '0 ₫' : '0';
  }

  const {
    showSymbol = true,
    symbol = '₫',
    compact = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options || {};

  // Use en-US locale for comma separator (1,000,000) which looks cleaner in English UI
  // or use 'vi-VN' for dot separator (1.000.000) if preferred.
  // Switching to 'en-US' style for consistency with English UI.
  const locale = 'en-US';

  if (compact) {
    return (
      new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }).format(amount) + (showSymbol ? ` ${symbol}` : '')
    );
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return showSymbol ? `${formatted} ${symbol}` : formatted;
};

/**
 * Format number to VNĐ currency string with "VND" suffix for international look
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "1,000,000 VND")
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  return formatVND(amount, { symbol: 'VND' });
};

/**
 * Legacy support
 */
export const formatVNDShort = (amount: number | null | undefined): string => {
  return formatVND(amount, { symbol: 'đ' });
};
