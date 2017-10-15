# Baidu-UNIT
This is baidu NUIT for Node.js, It's not official SDK, but It is better than baidu official

**Laset version is 2.0.0**

If you have any question, you can send me [aokihu@gmail.com](mailto:aokihu@gmail.com)

## INSTALL

You can use npm

```bash
npm install baidu_unit
```

OR use yarn

```bash
yarn add baidu_unit
```

## HOT TO USE

```javascript
const UNIT = require('baidu-unit');

const sceneid = ...; // You can use yourself scence id

const unit = new UNIT({
  apiKey: ..., // You can use yourself API Key
  secretKey: ..., // You can use yourself Secret Key
  sceneid
});

unit.init(); // Fetch the access token

unit.on('ready', () => {
  unit.query('现在几点');
});

unit.on('error', console.log);
unit.on('fail', console.log)

unit.on('success', (data) => {
  console.log(data);
});

```

### EVENTS

There is only 4 event types

* ***ready***
This event is fired after fetch access token, you must wait the token ready, and the token will be saved automatical for one month, so you just download once per month

* ***success***
When success parsed your text's intent, the event will be fired and contain intent information.

* ***error***
It will be fired when network is not good, or other reasons.

* ***fail***
It is fired when upload data success, but it can not parse the intent, you can train more data to work better.

### INTENT STRUCTION

* ***raw*** The raw query text
* ***intent*** The parsed intent, the value is **ALL CAPITAL**
* ***confidence*** Confidence level of results
* ***slots*** Slots is object, you can directly use the KEY to fetch the slot value.
  * ***confidence*** Confidence level of slot
  * ***original_word*** Raw text
  * ***normalized_word*** The value is empty in normal, but if the slot type is 'TIME' OR 'POSITION', it will translate right time or position information automatical
  * ***type*** Same the slot key
* ***emotion*** The emotional level of language
  * ***positive*** The positive degree of language emotion, MAX is 1
  * ***confidence*** Confidence in language feeling
