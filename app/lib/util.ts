export const shortenHex = (hex: string) => {
  if (!hex) return '';
  if (hex.length <= 12) return hex;
  return hex.substring(0, 6) + '...' + hex.slice(-4);
};
