#!/bin/bash

base_path="common/ch-configs"

# Start by initializing the docker-compose command with the redis compose file
compose_command="docker compose -f $base_path/compose.redis.yml"

# Add the root compose file
compose_command="$compose_command -f $base_path/compose.server.yml"

# Find all other compose.server.yml files and add them to the command
for compose_file in $(find $base_path -name "compose.server.yml" -not -path "$base_path/compose.server.yml"); do
  compose_command="$compose_command -f $compose_file"
done

# Add the up -d to the end of the command
compose_command="$compose_command up -d"

# Print the command (for debugging purposes)
echo "Executing command: $compose_command"

# Execute the constructed docker-compose command
eval $compose_command

echo "All services have been started."
