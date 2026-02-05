/**
 * Formats bytes to a localized human-readable string.
 * @param {number} bytes - The number of bytes.
 * @returns {string} - Formatted size (e.g., "1.5 MB" or "1,5 Mo" in French).
 */
export function formatFileSize(bytes: number, maxDecimals: number = 1): string {
  if (bytes === 0) return '0 B'

  const k = 1000
  const sizes = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte']

  // Determine the exponent (0 for B, 1 for KB, etc.)
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)

  const value = bytes / Math.pow(k, i)

  return new Intl.NumberFormat(navigator.language, {
    style: 'unit',
    unit: sizes[i],
    unitDisplay: 'short',
    maximumFractionDigits: maxDecimals
  }).format(value)
}
