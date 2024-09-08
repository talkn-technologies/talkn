# Java のインストール

brew install openjdk
echo 'export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"' >> ~/.zshrc
export CPPFLAGS="-I/opt/homebrew/opt/openjdk/include"

# シンボルを作成、これで Java ~でコマンド使用出来るようになる

sudo ln -sfn $(brew --prefix)/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk

# 作成したシンボルを削除したい時（※実行して確認を取ってないので、こちらのコマンドは実行前に確認をお願いします。）

sudo rm /Library/Java/JavaVirtualMachines/openjdk.jdk

# Java のバージョン確認

# 問題なくインストールされていればバージョンが表示される

java -version

# 本体インストール

https://jmeter.apache.org/download_jmeter.cgi

bin/jmeter を実行
(開けない場合は「プライバシーとセキュリティ」の「セキュリティ」で「このまま開く」を実行。)

# プラグインインストール

https://jmeter-plugins.org/install/Install/

JMeterPlugins-Manager-x.x.jar ファイルを JMETER_HOME/lib/ext ディレクトリにコピー。
再起動後に「JMeterPluginManager」を開き「Available Plugin」タブを開き「WebSocket Samplers by Peter Doornbosch」をチェック。
「ApplyChangesAnd RestartHmeter」を押す。
