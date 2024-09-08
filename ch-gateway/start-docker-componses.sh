#!/bin/bash

base_path="common/ch-configs"

# Function to start docker-compose for each service
start_docker_compose() {
  local compose_file=$1
  echo $compose_file
  docker-compose -f $compose_file up -d
}

# Start the root service
start_docker_compose "$base_path/compose.gateway.yml"

# Find and start all other services
find $base_path -name "compose.gateway.yml" -not -path "$base_path/compose.gateway.yml" | while read -r compose_file; do
  start_docker_compose "$compose_file"
done

echo "All services have been started."
