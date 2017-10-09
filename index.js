/**
 * 
 */

const EventEmitter = require('events');

const got = require('./request.js');
const Token = require('./token.js');

const UNIT_SERVICE_URL = 'https://aip.baidubce.com/rpc/2.0/solution/v1/unit_utterance';

/**
 * @class BaiduUNIT
 */
class BaiduUNIT extends EventEmitter {
  /**
   * @constructor
   * @param {string} appId Baidu App ID, you can find it in baidu console
   * @param {string} apiKey App api key
   * @param {string} secretKey App secret key
   * @param {string} token If you have baidu service token, you can pass directly
   * @param {integer} sceneid Scence ID
   */
  constructor({ apiKey, secretKey, token, sceneid }) {
    super();

    // Private variable
    this._ = {
      apiKey,
      secretKey,
      token,
      sceneid,
      sessionid: null,
      tokenInit: false, // Whether token is init
    };
  }

  /**
   * @public
   * @function init()
   * @description You could init fetch token manually
   */
  init() {
    if (this._.tokenInit) { return true; }

    const tokenSession = new Token({ apiKey: this._.apiKey, secretKey: this._.secretKey });
    tokenSession.on('ready', (token) => {
      this._.token = token;
      this._.status = 'ready';
      this.emit('ready');
      this._.tokenInit = true;
    });

    tokenSession.initToken();
    return true;
  }

  /**
   * @public
   * @description return token value
   */
  get token() {
    return this._.token;
  }

  /**
   * @public
   * @function process(input)
   * @param {string} text You want to process string
   */
  query(text) {
    const postData = JSON.stringify({
      scene_id: this._.sceneid,
      query: text,
      session_id:
      this._.sessionid });


    const url = `${UNIT_SERVICE_URL}?access_token=${this._.token}`;

    got({
      headers: { 'Content-Type': 'application/json;' },
      url,
      method: 'POST',
      postData,
    }).then((body) => {
      const ret = JSON.parse(body);
      this.emit('debug', body);
      if (ret.error_code) {
        this.emit('error', ret);
      } else {
        this._.session_id = ret.result.session_id;
        const intents = ret.result.qu_res.intent_candidates.map(item => ({
          intent: item.intent,
          confidence: item.intent_confidence,
          slots: item.slots }));

        this.emit('success', intents);
      }
    });
  }
}

module.exports = BaiduUNIT;
