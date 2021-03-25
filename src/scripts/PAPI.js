import HmacSHA1 from 'crypto-js/hmac-sha1.js';
import Base64 from 'crypto-js/enc-base64.js';
import axios from 'axios';

export default class PAPI {
  constructor(config) {
    const defaults = {
      key: '',
      accessid: '',
      server: '',
      domain: '',
      appid: '100',
      orgid: '1',
      scheme: 'https://',
      path: 'PAPIService/REST',
      version: 'v1',
      lang: '1033',
      encode: 'application/json',
      accept: 'application/json',
      auth: 'public',
      authlvl: 'public',
      logging: true,
      token: null,
      pass: null,
      method: 'GET',
    };

    this.initTime = PAPI.polarisDate();
    this.config = {
      ...defaults,
      ...config,
    };
  }

  /**
   * Get date formated to RFC-1123.
   *
   * @returns {string} - RFC-1123 formatted date string
   */
  static polarisDate() {
    return new Date().toUTCString();
  }

  /**
   * Build polaris signature for authentication request header
   *
   * @param {string} method - 'get' 'post' etc
   * @param {string} url    - endpoint being requested
   * @param {string} pass   - the user password or staff access secret
   *
   * @requires crypto-js/hmac-sha1
   * @requires crypto-js/enc-base64
   *
   * @returns {object} - with structure: { sig : 'generated signature', date: 'A RFC 1123 GMT Date' }
   */
  buildSignature(method, url, pass = '') {
    const date = PAPI.polarisDate();
    const sig = method + url + date + pass;
    return {
      sig: `PWS ${this.config.accessid}:${HmacSHA1(sig, this.config.key).toString(Base64)}`,
      date,
    };
  }

  /**
   * Send a call to the polaris API
   *
   * This function does most of the heavy lifting of talking to the API.
   * It will load default values for most things but you can override by passing params
   *
   * @param {string} url              - the endpoint being requested
   * @param {object} [params]         - you can override default options & env settings by passing options in params
   * @param {string} [params.scheme]  - ex: https://
   * @param {string} [params.server]  - ex: polaris.mylibrary.org
   * @param {string} [params.path]    - ex: PAPIService/REST
   * @param {string} [params.version] - ex: v1
   * @param {string} [params.appid]   - ex: 100
   * @param {string} [params.orgid]   - ex: 1
   * @param {string} [params.method]  - ex: GET
   * @param {string} [params.auth]    - ex: public
   * @param {string} [params.authlvl] - ex: public
   * @param {string} [params.pass]    - ex: myPassword
   * @param {string} [params.token]   - Generated Staff Authorization Token | Required for protected methods
   * @param {string} [params.lang]    - ex: 1033
   * @param {string} [params.encode]  - ex: application/json
   * @param {string} [params.accept]  - ex: application/json
   * @param {object} [data]           - required for POST/PUT methods, accepts basically anything Javascript can stringify
   *
   * @requires axios
   * @requires es6-promise
   *
   * @returns {promise}               - an Axios Promise
   *
   * @example
      myPapi.call('bib/979127', { lang: '3082' })
          .then(function(response){
              console.log(response.data);
          })
          .catch(function(error) {
              console.log(error);
          };
  */
  call(endpoint, params = {}, data = false) {
    // Get root config
    let { config } = this;

    config = {
      ...config,
      ...params,
    };
    // Check for preceding /
    if (!endpoint) throw new Error('You must provide an endpoint to call');
    if (endpoint.startsWith('/')) throw new Error('Do not include a preceding / in your endpoint.');

    // Implode base path pieces
    let url = config.scheme + [
      config.server,
      config.path,
      config.auth,
      config.version,
      config.lang,
      config.appid,
      config.orgid,
    ].join('/');

    // If calling a protected method, append the authentication token
    if (config.auth === 'protected') {
      if (config.token) url = `${url}/${config.token}`;
      else if (endpoint.toLowerCase() !== 'authenticator/staff') throw new Error('You must use an access token when calling protected methods.');
    }

    // Append endpoint
    url = `${url}/${endpoint}`;

    // Generate date and signature elements
    const sig = this.buildSignature(config.method.toUpperCase(), url, config.secret);

    // Build Axios Config
    const xhrCfg = {
      headers: {
        'Content-Type': config.encode,
        Accept: config.accept,
      },
      method: config.method,
      url: encodeURI(url),
    };

    // If calling a public method with protected flag, append the staff token to header
    if (config.auth !== 'protected' && config.token) xhrCfg.headers['X-PAPI-AccessToken'] = config.token;

    // If calling a protected method or not using patron level auth, Append date & sig to header
    if (config.auth === 'protected' || config.authlvl !== 'patron') {
      xhrCfg.headers.PolarisDate = sig.date;
      xhrCfg.headers.Authorization = sig.sig;
    }

    // If data was provided, encode and include it in the request
    if (data) xhrCfg.data = data;

    // Call Axios
    return axios(xhrCfg);
  }
}
