const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// SSL証明書の読み込み
const privateKey = fs.readFileSync('/etc/letsencrypt/live/talkn.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/talkn.io/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/talkn.io/chain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

// HTTPサーバーでHTTPSにリダイレクト
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
});

// HTTPSサーバーでリクエストを処理
const httpsServer = https.createServer(credentials, (req, res) => {
  if (req.url.startsWith('/.well-known/acme-challenge/')) {
    // ACMEチャレンジ用ファイルを提供
    const challengePath = path.join('/var/www/certbot', req.url);
    fs.readFile(challengePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  } else {
    res.writeHead(200);
    res.end('Hello, HTTPS World!');
  }
});

// サーバーをリッスン
httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80');
});
httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
