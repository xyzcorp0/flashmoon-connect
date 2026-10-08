const http = require('http');

function keepAlive() {
  http.createServer((req, res) => {
    res.end('FlashMoon Connect ON !');
  }).listen(process.env.PORT || 8080, '0.0.0.0');
}

module.exports = { keepAlive };
