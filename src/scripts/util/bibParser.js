/**
 * Converts a set of bib record rows into an object that is easier to use
 * @param {Object} bib A bib record from Polaris API
 */
 
export default function(bib) {
  if (bib.PAPIErrorCode !== 0) return false;
  const p2 = {};
  bib.BibGetRows.forEach((v) => {
    let id = v.ElementID;
    if (!p2[id]) p2[id] = {
      label: v.Label,
      typeID: id,
      type: lookupType(id),
      values: [],
    }
    p2[id].values.push(v.Value);
  });

  return p2;
}

function lookupType(id) {
  const types = {
    2: 'publisher',
    3: 'description',
    5: 'edition',
    6: 'isbn',
    7: 'available',
    8: 'holds',
    9: 'summary',
    13: 'cn',
    16: 'systemIn',
    17: 'format',
    18: 'author',
    20: 'subjects',
    23: 'lccn',
    28: 'notes',
    35: 'title',
    44: 'targetAudience',
  }
  let type = types[id];
  if (!type) console.log(`Missing bib type ${id}`);
  return (type) ? type : id;
}