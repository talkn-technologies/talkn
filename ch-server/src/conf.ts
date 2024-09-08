/*
import fs from 'fs';
import os from 'os';

const homeDir = os.homedir();

const isDocker = Boolean(process.env.IS_DOCKER);
const isDev = Boolean(process.env.NODE_ENV === 'development');

const localhostPemKey = `${homeDir}/talkn-certs/localhost.key`;
const localhostPemCrt = `${homeDir}/talkn-certs/localhost.crt`;
const dokcerPemKey = isDev ? '/etc/ssl/certs/localhost.key' : '/etc/letsencrypt/live/talkn.io/privkey.pem';
const dokcerPemCrt = isDev ? '/etc/ssl/certs/localhost.crt' : '/etc/letsencrypt/live/talkn.io/cert.pem';
const sslKey = isDocker ? dokcerPemKey : localhostPemKey;
const sslCrt = isDocker ? dokcerPemCrt : localhostPemCrt;

console.log(sslKey);
console.log(sslCrt);

const host = isDocker ? String(process.env.REDIS_HOST) : 'localhost';
const redisPort = isDocker ? Number(process.env.REDIS_PORT) : 6379;

const conf = {
  serverOption: {
    cors: { credentials: true },
  },
  io: {
    proxy: { host, port: 10443 },
    root: { host, port: 10444 },
    ch: { host, port: 10445 },
  },
  redis: {
    limit: 20,
    host,
    port: redisPort,
  },
  ssl: { key: fs.readFileSync(sslKey), cert: fs.readFileSync(sslCrt) },
};

export default conf;
*/

import fs from 'fs';
import os from 'os';

const homeDir = os.homedir();
const isDocker = Boolean(process.env.IS_DOCKER);
const localhostPemKey = `${homeDir}/talkn-ch-gateway/common/nginx/localhost/openssl.key`;
const localhostPemCrt = `${homeDir}/talkn-ch-gateway/common/nginx/localhost/openssl.crt`;
const productPemKey = `/etc/ssl/certs/openssl.key`;
const productPemCrt = `/etc/ssl/certs/openssl.crt`;
// const productPemKey = '/etc/letsencrypt/live/talkn.io/privkey.pem';
// const productPemCrt = '/etc/letsencrypt/live/talkn.io/cert.pem';

const sslKey = isDocker ? productPemKey : localhostPemKey;
const sslCrt = isDocker ? productPemCrt : localhostPemCrt;

const host = isDocker ? String(process.env.REDIS_HOST) : 'localhost';
const redisPort = isDocker ? Number(process.env.REDIS_PORT) : 6379;

console.log(isDocker);
console.log(host);
console.log(redisPort);
console.log(sslKey);
console.log(sslCrt);

const conf = {
  serverOption: {
    cors: { credentials: true },
  },
  io: {
    proxy: { host: 'localhost', port: 10443 },
    root: { host: 'localhost', port: 10444 },
    ch: { host: 'localhost', port: 10445 },
  },
  redis: {
    limit: 20,
    host,
    port: redisPort,
  },
  ssl: {
    key: fs.readFileSync(sslKey),
    cert: fs.readFileSync(sslCrt),
  },
};

export default conf;
