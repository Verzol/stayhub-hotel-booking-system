/**
 * Currency formatting utilities
 */

/**
 * Format number to VNĐ currency string
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "1,000,000 ₫")
 */
export const formatVND = (
  amount: number | null | undefined,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  if (amount == null || isNaN(amount)) {
    return options?.showSymbol !== false ? '0 ₫' : '0';
  }

  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options || {};

  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return showSymbol ? `${formatted} ₫` : formatted;
};

/**
 * Format number to VNĐ currency string with "đ" suffix
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "1,000,000 đ")
 */
export const formatVNDShort = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) {
    return '0 đ';
  }

  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return `${formatted} đ`;
};
