const axios = require('axios');
const jsPAPI = require('./dist/jsPAPI.js');

const cfg = {
  accessid: 'drupal',
  key: '',
  orgid: '1',
  server: 'catalog.midcolumbialibraries.org',
  domain: 'MCL-LIB',
  authlvl: 'patron'
};
const api = new jsPAPI(cfg, axios);
api.limitFiltersGet().then((r) => console.log(r));
