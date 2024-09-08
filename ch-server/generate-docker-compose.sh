#!/bin/bash

# JSON ファイルの絶対パスまたは相対パスを指定
input_json="./common/src/ch-config.json"  # パスを実際の場所に変更

# docker-compose.yml の初期化
output_file="docker-compose.yml"

# JSON が存在するか確認
if [ ! -f "$input_json" ]; then
  echo "Error: $input_json not found!"
  exit 1
fi

# docker-compose.yml の初期化
cat <<EOL > $output_file
services:
  redis-root:
    container_name: talkn-ch-server-redis-root
    image: redis:6.2
    volumes:
      - redis-data:/data
    networks:
      - talkn-global

EOL

# JSON を処理する関数 (ルートのみ処理)
process_services() {
  local json="$1"
  local parent_path="$2"

  # 現在のレベルの情報を処理
  local gateway_port=$(echo "$json" | jq -r '.gateway.port // empty')
  local nginx_location=$(echo "$json" | jq -r '.nginx.location // empty')

  # サービス名を決定
  local service_name=$(echo "$nginx_location" | sed 's|/$||; s|/|_|g')
  [ -z "$service_name" ] && service_name="root"

  # パスを処理
  if [ "$service_name" == "root" ]; then
    openssl_path="~/talkn-ch-gateway/common/ch-configs"
  else
    openssl_path="~/talkn-ch-gateway/common/ch-configs/${service_name}"
  fi

  # サービスの定義を docker-compose.yml に追加
  cat <<EOL >> $output_file
  io-$service_name:
    container_name: talkn-ch-server-io-$service_name
    image: node:22.2.0
    depends_on:
      - redis-root
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
      - $openssl_path/openssl.crt:/etc/ssl/certs/openssl.crt
      - $openssl_path/openssl.key:/etc/ssl/certs/openssl.key
    command: sh -c "npm install && npm run dev"

    environment:
      - IS_DOCKER=true
      - TOP_CONNECTION=${nginx_location}
      - NODE_ENV=development
      - REDIS_HOST=redis-root
      - REDIS_PORT=\${CH_PORT:-6379}
    networks:
      - talkn-global

EOL
}

# ルートレベルの nginx.location が "/" である場合に処理を行う
root_location=$(jq -r '.nginx.location' "$input_json")

if [ "$root_location" == "/" ]; then
  # ルートレベルのサービスを処理
  root_json=$(jq -c '.' "$input_json")
  process_services "$root_json" ""

  # 子要素を処理
  children=$(jq -c '.children[]' "$input_json")
  echo "$children" | while read -r child; do
    process_services "$child" "$root_location"
  done
else
  echo "nginx.location is not '/', skipping docker-compose generation."
  exit 1
fi

# volumes と networks の定義を追加
cat <<EOL >> $output_file
volumes:
  redis-data:

networks:
  talkn-global:
    external: true
EOL

echo "docker-compose.yml has been generated successfully."
