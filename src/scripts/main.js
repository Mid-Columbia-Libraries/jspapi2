import PAPI from './PAPI.js';

const cfg = {
  accessid: 'drupal',
  key: '6B378B10-8A4F-40FB-BF87-5DE126EF5D4A',
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
