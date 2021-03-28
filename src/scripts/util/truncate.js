/**
 * Truncates a string to given length on word boundary, adding ellipsis if truncated
 * @param {String} str
 * @param {Integer} n
 * @returns String
 */
 export default function truncate(str, n) {
  if (!str) return '';
  if (str.length <= n) { return str; }
  let s = str.substr(0, n - 1);
  s = s.substr(0, s.lastIndexOf(' '));
  return `${s}...`;
}
