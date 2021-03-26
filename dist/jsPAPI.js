(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.jsPAPI = factory()));
})(this, function () {
  "use strict";

  /* eslint-disable */
  /**
   * Computes a HMAC-SHA1 code.
   *
   * @param {string} k Secret key.
   * @param {string} d Data to be hashed.
   * @return {string} The hashed string.
   */
  function hmac_sha1(k, d, _p, _z) {
    // heavily optimized and compressed version of http://pajhome.org.uk/crypt/md5/sha1.js
    // _p = b64pad, _z = character size; not used here but I left them available just in case
    if (!_p) {
      _p = "=";
    }
    if (!_z) {
      _z = 8;
    }
    function _f(t, b, c, d) {
      if (t < 20) {
        return (b & c) | (~b & d);
      }
      if (t < 40) {
        return b ^ c ^ d;
      }
      if (t < 60) {
        return (b & c) | (b & d) | (c & d);
      }
      return b ^ c ^ d;
    }
    function _k(t) {
      return t < 20
        ? 1518500249
        : t < 40
        ? 1859775393
        : t < 60
        ? -1894007588
        : -899497514;
    }
    function _s(x, y) {
      var l = (x & 0xffff) + (y & 0xffff),
        m = (x >> 16) + (y >> 16) + (l >> 16);
      return (m << 16) | (l & 0xffff);
    }
    function _r(n, c) {
      return (n << c) | (n >>> (32 - c));
    }
    function _c(x, l) {
      x[l >> 5] |= 0x80 << (24 - (l % 32));
      x[(((l + 64) >> 9) << 4) + 15] = l;
      var w = [80],
        a = 1732584193,
        b = -271733879,
        c = -1732584194,
        d = 271733878,
        e = -1009589776;
      for (var i = 0; i < x.length; i += 16) {
        var o = a,
          p = b,
          q = c,
          r = d,
          s = e;
        for (var j = 0; j < 80; j++) {
          if (j < 16) {
            w[j] = x[i + j];
          } else {
            w[j] = _r(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
          }
          var t = _s(_s(_r(a, 5), _f(j, b, c, d)), _s(_s(e, w[j]), _k(j)));
          e = d;
          d = c;
          c = _r(b, 30);
          b = a;
          a = t;
        }
        a = _s(a, o);
        b = _s(b, p);
        c = _s(c, q);
        d = _s(d, r);
        e = _s(e, s);
      }
      return [a, b, c, d, e];
    }
    function _b(s) {
      var b = [],
        m = (1 << _z) - 1;
      for (var i = 0; i < s.length * _z; i += _z) {
        b[i >> 5] |= (s.charCodeAt(i / 8) & m) << (32 - _z - (i % 32));
      }
      return b;
    }
    function _h(k, d) {
      var b = _b(k);
      if (b.length > 16) {
        b = _c(b, k.length * _z);
      }
      var p = [16],
        o = [16];
      for (var i = 0; i < 16; i++) {
        p[i] = b[i] ^ 0x36363636;
        o[i] = b[i] ^ 0x5c5c5c5c;
      }
      var h = _c(p.concat(_b(d)), 512 + d.length * _z);
      return _c(o.concat(h), 512 + 160);
    }
    function _n(b) {
      var t =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        s = "";
      for (var i = 0; i < b.length * 4; i += 3) {
        var r =
          (((b[i >> 2] >> (8 * (3 - (i % 4)))) & 0xff) << 16) |
          (((b[(i + 1) >> 2] >> (8 * (3 - ((i + 1) % 4)))) & 0xff) << 8) |
          ((b[(i + 2) >> 2] >> (8 * (3 - ((i + 2) % 4)))) & 0xff);
        for (var j = 0; j < 4; j++) {
          if (i * 8 + j * 6 > b.length * 32) {
            s += _p;
          } else {
            s += t.charAt((r >> (6 * (3 - j))) & 0x3f);
          }
        }
      }
      return s;
    }
    function _x(k, d) {
      return _n(_h(k, d));
    }
    return _x(k, d);
  }

  class jsPAPI {
    constructor(config, axios_instance) {
      const defaults = {
        key: "",
        accessid: "",
        server: "",
        domain: "",
        appid: "100",
        orgid: "1",
        scheme: "https://",
        path: "PAPIService/REST",
        version: "v1",
        lang: "1033",
        encode: "application/json",
        accept: "application/json",
        auth: "public",
        authlvl: "public",
        logging: true,
        token: null,
        pass: null,
        method: "GET",
      };

      this.axios = axios_instance || axios;
      if (typeof axios === undefined)
        throw new Error(
          "You must provide access to axios either as a parameter or in the global scope"
        );
      this.initTime = jsPAPI.polarisDate();
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
    buildSignature(method, url, pass = "") {
      const date = jsPAPI.polarisDate();
      const sig = method + url + date + pass;
      const hash = hmac_sha1(this.config.key, sig);
      let encoded;
      // For browsers
      if (typeof btoa !== "undefined") encoded = btoa(hash);
      // For nodejs
      else encoded = hash.toString("base64");
      return {
        sig: `PWS ${this.config.accessid}:${encoded}`,
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
      if (!endpoint) throw new Error("You must provide an endpoint to call");
      if (endpoint.startsWith("/"))
        throw new Error("Do not include a preceding / in your endpoint.");

      // Implode base path pieces
      let url =
        config.scheme +
        [
          config.server,
          config.path,
          config.auth,
          config.version,
          config.lang,
          config.appid,
          config.orgid,
        ].join("/");

      // If calling a protected method, append the authentication token
      if (config.auth === "protected") {
        if (config.token) url = `${url}/${config.token}`;
        else if (endpoint.toLowerCase() !== "authenticator/staff")
          throw new Error(
            "You must use an access token when calling protected methods."
          );
      }

      // Append endpoint
      url = encodeURI(`${url}/${endpoint}`);
      const headers = {
        "Content-Type": config.encode,
        Accept: config.accept,
      };

      // Generate date and signature elements
      const sig = this.buildSignature(
        config.method.toUpperCase(),
        url,
        config.secret
      );

      // Build Axios Config
      const xhr = {
        headers,
        method: config.method,
        url,
      };

      // If calling a public method with protected flag, append the staff token to header
      if (config.auth !== "protected" && config.token)
        xhrCfg.headers["X-PAPI-AccessToken"] = config.token;

      // If calling a protected method or not using patron level auth, Append date & sig to header
      if (config.auth === "protected" || config.authlvl !== "patron") {
        xhrCfg.headers.PolarisDate = sig.date;
        xhrCfg.headers.Authorization = sig.sig;
      }

      // If data was provided, encode and include it in the request
      if (data) xhr.data = data;

      // Call Axios and return promise
      return this.axios(xhr);
    }

    /**
     * Authenticates and returns an access token for a patron
     *
     * @param {string} barcode
     * @param {string} password
     * @returns {promise}
     *
     * @example myPapi.authenticatePatron('1234567890', 'patron-password')
     *      .then(function(response) {
     *          console.log(response.data);
     *      });
     */
    authenticatePatron(Barcode, Password) {
      return this.call(
        "authenticator/patron",
        { auth: "public", method: "POST" },
        { Barcode, Password }
      );
    }

    /**
     * Authenticates staff credentials
     *
     * @param {string} user - your staff user's username
     * @param {string} pass - your staff user's password
     * @param {string} [domain=config.domain] - hint:domain is listed when signing into polaris staff client
     * @returns {promise}
     *
     * @example myPapi.authenticateStaff('vance', 'my-password')
     *      .then(function(response) {
     *          console.log(response.data);
     *      });
     */
    authenticateStaff(Username, Password, Domain = this.config.domain) {
      return this.call(
        "authenticator/staff",
        { auth: "protected", method: "POST" },
        { Domain, Username, Password }
      );
    }

    /**
     * Simple request to get a bib record by ID (Control Number)
     *
     * @param {integer} id - The bibligraphic ID you want to load
     * @returns {promise}
     *
     * @example
     * api.bibGet('1314713')
     *   .then((response) => {
     *     console.log(response.data);
     *   });
     */
    bibGet(id) {
      return this.call(`bib/${id}`);
    }

    /**
     * A more robust search method
     *
     * @param {string|array} terms  - either a literal string or an array of the form [[bool, filter, value],['AND', 'AU', 'Tolkien'], ...]
     * @param {int|string} page     - the search result page to return
     * @param {int|string} per      - number of results per page
     * @param {string|array} [limit]
     * @param {string|array} [ccl]
     * @returns {promise}
     *
     * @example api.bibSearch('KW=dogs')
     *      .then((response) => {
     *          console.log(response.data);
     *      });
     *
     * @example api.bibSearch([['AND','AU','Tolkien'],['NOT','TI','Hobbits']])
     *      .then((response) => {
     *          console.log(response.data);
     *      });
     */

    bibSearch(terms, page = 1, per = 10, limit = false, ccl = false) {
      let url = "search/bibs/boolean?q=";
      // If a string was given, use as-is
      if (typeof terms === "string") url += terms;
      // Otherwise, if an object was given split to key|value pairs
      else {
        for (let i = 0; i < terms.length; i++) {
          if (i == 0) {
            url += terms[i][1] + "=" + terms[i][2] + " ";
          } else {
            url += terms[i][0] + " " + terms[i][1] + "=" + terms[i][2] + " ";
          }
        }
      }
      url = url + "&page=" + page + "&bibsperpage=" + per;
      return this.call(url);
    }

    /**
     * A simplified search interface accepting a Type:Value pair
     *
     * @param {string} search   - The search term
     * @param {string} kw       - KW|TI|AU|SU|NOTE|PUB|GENRE|SE|ISBN|ISSN|LCCN|PN|LC|DD|LOCAL|SUDOC|CODEN|STRN|CN|BC
     * @param {int|string} page - the search result page to return
     * @param {int|string} per  - number of results per page
     * @returns {promise}
     *
     * @example
     * api.bibSearchKW('dogs', 'KW')
     *   .then((response) => {
     *     console.log(response.data);
     *   });
     */

    bibSearchKW(search, kw = "KW", page = 1, per = 10) {
      return this.call(
        `search/bibs/keyword/${kw.toUpperCase()}?q=${search}&page=${page}&bibsperpage=${per}`
      );
    }

    /**
     * Returns the limit filters that this Polaris API understands
     * Note: this method does not generally return all possible filters
     *
     * @returns {promise}
     * @example
     * api.limitFiltersGet()
     *   .then((response) => {
     *     console.log(response.data);
     *   });
     */
    limitFiltersGet() {
      return this.call("limitfilters");
    }
  }

  return jsPAPI;
});
