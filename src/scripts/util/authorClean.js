/**
 * Polaris bib listings often have a lot of junk in the author field.
 * This function attempts to clean them up to something more like `Last, First`
 * @param {String} author The author string from Polaris API to be cleaned up
 * @returns {String}
 */
 export default function authorClean(author) {
  if (!author) return '';
  return author
    .replace(/[^a-zA-Z,. ]/g, '')
    .replace(/author|artist|illustrator/g, '')
    .replace(/[^a-zA-Z]+$/g, '')
    .replace(/[ \t]{2,}/g, '')
    .trim();
}
