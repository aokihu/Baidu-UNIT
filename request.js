const { URL } = require('url');

/**
 * 实现got操作
 */
function got({ method = 'GET', url = '', headers = {}, postData = null }) {
  const parsedUrl = new URL(url);
  return new Promise((resolve, reject) => {
    const options = {
      headers,
      method,
      hostname: parsedUrl.hostname,
      protocol: parsedUrl.protocol,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
    };

    let client = null;

    if (parsedUrl.protocol === 'https:') {
      client = require('https');
      options.port = 443;
    } else {
      client = require('http');
    }

    const req = client.request(options, (res) => {
      const result = [];
      res.on('data', chunk => result.push(chunk));
      res.on('end', () => { resolve(result.join('')); });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}


/**
 * Module export
 */
module.exports = got;
