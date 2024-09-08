import https from 'https';

import conf from '@server/conf';
import { Connection } from '@common/models/Ch';
import { ChConfig } from '@common/models/ChConfig';

const { io, ssl } = conf;

const getHttpsServer = async (topConnection: Connection, myChConfig: ChConfig): Promise<https.Server> => {
  const ioPort = Number(myChConfig?.nginx.port);
  return new Promise((resolve, reject) => {
    const httpsServer = https.createServer(ssl);
    httpsServer
      .listen(ioPort, () => {
        console.info('@@@@@@@@@@@ TOP CONNECTION @@@@@@@@@@@');
        console.info(topConnection, myChConfig.nginx.host, ioPort);
        console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');

        resolve(httpsServer);
      })
      .on('error', (err) => {
        console.error('listens.https.ts Error occurred:', err);
      });
  });
};

export default getHttpsServer;
