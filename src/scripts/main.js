import PAPI from './PAPI.js';

const cfg = {
  accessid: 'drupal',
  key: '',
  orgid: '1',
  server: 'catalog.midcolumbialibraries.org',
  domain: 'MCL-LIB',
};

const api = new PAPI(cfg);
api.call('bib/979127', { lang: '3082' })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
