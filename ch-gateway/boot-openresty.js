const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// nginx.confファイルのパスを設定
const nginxConfPath = path.join(__dirname, "nginx/nginx.conf");

// listenポートを取得
const nginxConf = fs.readFileSync(nginxConfPath, "utf-8");
const listenPortMatch = nginxConf.match(/listen\s+(\d+)/);
const listenPort = listenPortMatch ? listenPortMatch[1] : null;

if (!listenPort) {
  console.error("No listen port found in nginx configuration file.");
  process.exit(1);
}

// プロセスの強制終了関数
const killProcesses = (pids, callback) => {
  if (pids.length === 0) {
    callback();
    return;
  }

  const pid = pids.pop();
  exec(`kill -9 ${pid}`, (killErr) => {
    if (killErr) {
      console.error(
        `Failed to kill process ${pid} on port ${listenPort}: ${killErr}`
      );
    } else {
      console.log(`Killed process ${pid} on port ${listenPort}`);
    }
    killProcesses(pids, callback);
  });
};

// openrestyを起動する関数
const startOpenresty = () => {
  exec(`openresty -c ${nginxConfPath}`, (openrestyErr) => {
    if (openrestyErr) {
      console.error(`Failed to start openresty: ${openrestyErr}`);
      return;
    }
    console.log("Started openresty with config", nginxConfPath);

    // logs/access.logをtail -fで20行出力
    const logFilePath = path.join(__dirname, "logs/access.log");
    fs.writeFileSync(logFilePath, "");
    const tailProcess = exec(`tail -n 20 -f ${logFilePath}`);

    tailProcess.stdout.on("data", (data) => {
      console.log(data);
    });

    tailProcess.stderr.on("data", (data) => {
      console.error(`tail error: ${data}`);
    });
  });
};

// 取得したポートで動作しているプロセスを強制終了
exec(`lsof -t -i:${listenPort}`, (err, stdout) => {
  if (err || !stdout.trim()) {
    console.error(
      `No processes found on port ${listenPort} or failed to find processes: ${err}`
    );
    startOpenresty();
    return;
  }

  const pids = stdout
    .trim()
    .split("\n")
    .filter((pid) => pid);
  killProcesses(pids, startOpenresty);
});
