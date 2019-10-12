#!/bin/bash
set -e
echo "-===[ Parabol Action Docker Entrypoint ]===-"
yarn entry
exec "$@"

