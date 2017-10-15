/**
 * Baidu UNIT
 * @author aokihu aokihu@gmail.com
 * @version 2.0.0
 * @license MIT
 */

const EventEmitter = require('events');
const iconv = require('iconv-lite');
const got = require('little-fetch');
const R = require('ramda');
const Token = require('./token.js');

const UNIT_SERVICE_URL = 'https://aip.baidubce.com/rpc/2.0/solution/v1/unit_utterance';
const EMOTION_SERVICE_URL = 'https://aip.baidubce.com/rpc/2.0/nlp/v1/sentiment_classify';

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
  constructor({ apiKey, secretKey, token, sceneid, emotion }) {
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

    Promise.all([this._queryIntent(text), this._queryEmotion(text)])
    .then(result => {
      const [intents, emotion] = result;
      const intentsResult = this._parseIntentResut(intents);
      const emotionResult = this._parseEmotionResult(emotion);

      if(intentsResult.error_code)
      {
        this.emit('error', intentsResult);
      }
      else if(intentsResult.intent === 'FAIL')
      {
        this.emit('fail');
      }
      else
      {
        intentsResult.emotion = emotionResult
        this.emit('success', intentsResult);
      }

    })
    .catch(console.log)

  }

  /**
   * @private
   * @function _queryIntent
   * @description Get text's intents
   * @param {string} text Query text
   */
  _queryIntent(text){
    const url = `${UNIT_SERVICE_URL}?access_token=${this._.token}`;
    const postData = JSON.stringify({
      scene_id: this._.sceneid,
      query: text,
      session_id:this._.sessionid
    });

   return got({
      headers: { 'Content-Type': 'application/json;' },
      url,
      method: 'POST',
      postData,
    })
  }

  /**
   *
   * @param {string} text Query text
   */
  _queryEmotion(text){
    const url = `${EMOTION_SERVICE_URL}?access_token=${this._.token}`;
    const _text = iconv.encode(text, "GBK").toString();
    return got({
      headers: { 'Content-Type': 'application/json;' },
      url,
      method: 'POST',
      postData: JSON.stringify({text:_text}),
    })
  }

  /**
   * @private
   * @function _parseInitResult
   * @description Parse intent to human readable format
   * @param {Object} result Intents
   */
  _parseIntentResut(result){
      const _result = JSON.parse(result);
      if(_result.error_code){ return _result }
      else{
        const {intent_candidates} = _result.result.qu_res;
        const _intent = intent_candidates[0]

        if(_intent){

          const types = _intent.slots.map(item => item.type);

          return {
            raw: _result.result.qu_res.raw_query,
            intent: _intent.intent,
            confidence: _intent.intent_confidence,
            slots: R.zipObj(types,_intent.slots.map(d=>{return R.omit(['length','offset'],d)}))
          }
        }

        // Return FAIL intent
        return {raw: intent_candidates.raw_query,intent: 'FAIL'}
    }
  }

  /**
   * @private
   * @function _parseEmotionResult
   * @description Parse emotion result to human readable format
   * @param {Object} result Emotion result
   */
  _parseEmotionResult(result) {
    const _result = JSON.parse(result);
    const {positive_prob, confidence} = _result.items[0];
    return {positive:positive_prob, confidence};
  }
}

module.exports = BaiduUNIT;
