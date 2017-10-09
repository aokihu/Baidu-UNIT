const UNIT = require('./index.js');

const sceneid = 3679;
const unit = new UNIT({
  apiKey: '1VkerpAf4y8Ipdxc5R1xPsx1',
  secretKey: 'kUOllwbrube1Ke1dU0sKliy38h4iGsvB',
  sceneid,
});

unit.init();
unit.on('ready', () => {
  unit.query('现在时间');
});

unit.on('success', (data) => {
  console.log(data);
  data[0].slots.map(console.log);
})
;
