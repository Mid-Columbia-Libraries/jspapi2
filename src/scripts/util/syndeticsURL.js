/**
 * Formats and returns a syndetics image url for a given PAC item
 * @param {Object} item Polaris Bib Item
 * @returns {String}
 */
 export default function (client, isbn, upc, oclc) {
  return `https://syndetics.com/index.aspx?isbn=${isbn}/LC.JPG&client=${client}&upc=${upc}&oclc=${oclc}`;
}
