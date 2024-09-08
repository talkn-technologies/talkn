const fs = require('fs');
const { exec } = require('child_process');

const REDIS_SERVER_CONFIG_BASE_FILE = './redis/redis-server-base.conf';
const REDIS_CLUSTER_CONFIG_BASE_FILE = './redis/redis-cluster-base.conf';

const REDIS_CLUSTER_TMP_PATH = './redis/';
const INPUT_JSON_FILE = './common/src/ch-config.json';
let jsonData = JSON.parse(fs.readFileSync(INPUT_JSON_FILE, 'utf8'));

// 引数の値を取得
const args = process.argv.slice(2);
const topCh = args[0] || '/';

function buildFullLocationPath(data, parentLocation = '') {
  if (data.nginx && data.nginx.location) {
    data.nginx.fullLocation = parentLocation + data.nginx.location;
  }

  if (data.children && data.children.length > 0) {
    for (let child of data.children) {
      buildFullLocationPath(child, data.nginx.fullLocation || parentLocation);
    }
  }
}

function findMatchingLocation(data, location) {
  if (data.nginx && data.nginx.fullLocation === location) {
    // childrenを削除
    delete data.children;
    return data;
  }

  if (data.children && data.children.length > 0) {
    for (let child of data.children) {
      const result = findMatchingLocation(child, location);
      if (result) {
        // 親のchildrenも削除
        data.children = [result];
        return result;
      }
    }
  }

  return null;
}

// JSONデータにフルロケーションパスを追加
buildFullLocationPath(jsonData);

const matchedLocation = findMatchingLocation(jsonData, topCh);

if (matchedLocation) {
  jsonData = matchedLocation;

  if (!fs.existsSync(REDIS_CLUSTER_TMP_PATH)) {
    fs.mkdirSync(REDIS_CLUSTER_TMP_PATH, { recursive: true });
  }

  const startRedisServer = ({ host, port }, isCluster = false) => {
    const tempConfigFile = `${REDIS_CLUSTER_TMP_PATH}${port}/redis-server.conf`;
    try {
      if (!fs.existsSync(`${REDIS_CLUSTER_TMP_PATH}${port}/`)) {
        fs.mkdirSync(`${REDIS_CLUSTER_TMP_PATH}${port}/`, { recursive: true });
      }
      fs.copyFileSync(REDIS_CLUSTER_CONFIG_BASE_FILE, tempConfigFile);
      fs.chmodSync(tempConfigFile, 0o777);

      if (isCluster) {
        fs.appendFileSync(tempConfigFile, `\ncluster-enabled yes`);
        //      fs.appendFileSync(tempConfigFile, `\ncluster-config-file ${REDIS_CLUSTER_TMP_PATH}${port}/nodes.conf`);

        fs.appendFileSync(tempConfigFile, `\ncluster-node-timeout 5000`);
        fs.appendFileSync(tempConfigFile, `\ndir ${REDIS_CLUSTER_TMP_PATH}${port}/`);
        fs.appendFileSync(tempConfigFile, `\nport ${port}`);
      } else {
        fs.writeFileSync(`${REDIS_CLUSTER_TMP_PATH}${port}/redis.log`, '');
        fs.appendFileSync(tempConfigFile, `\nlogfile ${REDIS_CLUSTER_TMP_PATH}${port}/redis.log`);

        fs.copyFileSync(REDIS_SERVER_CONFIG_BASE_FILE, tempConfigFile);
        fs.appendFileSync(tempConfigFile, `\ndir ${REDIS_CLUSTER_TMP_PATH}${port}/`);
        fs.appendFileSync(tempConfigFile, `\nport ${port}`);
      }

      console.log(`1. redis-server ${tempConfigFile} &`);
      exec(`redis-server ${tempConfigFile} &`);
    } catch (err) {
      console.error('Error writing file:', err);
    }
  };

  const checkRedisClient = ({ host, port }) => {
    return new Promise((resolve, reject) => {
      const check = () => {
        console.log(`2. redis-cli -h ${host} -p ${port} ping`);
        exec(`redis-cli -h ${host} -p ${port} ping`, (error, stdout) => {
          if (!error && stdout.includes('PONG')) {
            resolve();
          } else {
            console.log(`error: ${error}`);
            setTimeout(check, 1000); // Try again in 1 second
          }
        });
      };
      check();
    });
  };

  const flushRedisClient = ({ host, port }) => {
    return new Promise((resolve, reject) => {
      console.log(`3. redis-cli -h ${host} -p ${port} flushall`);
      exec(`redis-cli -h ${host} -p ${port} flushall`, (error, stdout) => {
        if (error) {
          console.error(`error: Failed to flush Redis server at ${host}:${port}`, error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  const resetRedisClient = async ({ host, port }) => {
    await new Promise((resolve, reject) => {
      console.log(`4. redis-cli -h ${host} -p ${port} cluster reset`);
      exec(`redis-cli -h ${host} -p ${port} cluster reset`, (error, stdout) => {
        if (error) {
          console.error(`error: Failed to reset Redis server at ${host}:${port}`, error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  const startAndCheckAllRedisServers = async (redisArray) => {
    for (let redisConfig of redisArray) {
      await startAndCheckAllRedisServer(redisConfig, true);
    }
  };

  const startAndCheckAllRedisServer = async ({ host, port }, isCluster = false) => {
    startRedisServer({ host, port }, isCluster);
    await checkRedisClient({ host, port });
    await flushRedisClient({ host, port });
    await resetRedisClient({ host, port });
  };

  const createRedisCluster = async (redisArray) => {
    const nodeArgs = redisArray.map(({ host, port }) => `${host}:${port}`).join(' ');

    console.log('Creating Redis cluster...', `redis-cli --cluster create ${nodeArgs} --cluster-replicas 1`);

    exec(`echo "yes" | redis-cli --cluster create ${nodeArgs} --cluster-replicas 1`, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error('Failed to create Redis cluster:', error, stderr);
      } else {
        console.log('Redis cluster created successfully:', stdout);
      }
    });
  };

  const processNodes = async (node) => {
    if (node.redis) {
      console.log('@@@@@@@@@@', node.nginx.location, '@@@@@@@@@@');
      await startAndCheckAllRedisServer(node.redis.client);
      await startAndCheckAllRedisServers(node.redis.cluster);
      await createRedisCluster(node.redis.cluster);
    }

    if (node.children) {
      for (let child of node.children) {
        await processNodes(child);
      }
    }
  };

  const main = async () => {
    console.log(jsonData);
    await processNodes(jsonData);
  };

  main().catch(console.error);
} else {
  console.log('No matching location found');
}
