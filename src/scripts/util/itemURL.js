/**
 * Given a bib record item, returns a string URL to the catalog item on the configured PAC
 * 
 * @returns {string} - the link to the catalog item
 * @param {object|string} item - a single item from a bib record result, can be string/integer ControlNumber, or a full item record from api
 * @param {object} config - a jsPAPI config object with server settings f.x. domain etc
 */
 export default function itemURL(item, config) {
  const cn = item.ControlNumber ?? item;
  const url = `${config.scheme}${config.server}/${config.pacpath}/search/title.aspx?pos=1&cn=${cn}&ctx=${config.orgid}.${config.lang}`;
  return url;
}