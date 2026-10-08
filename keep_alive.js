import http from 'http';

export function keepAlive() {
  http.createServer((req, res) => {
    res.end('FlashMoon Connect ON !');
  }).listen(8080, '0.0.0.0');
}