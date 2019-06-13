#!/bin/bash
set -e
echo "-===[ Parabol Action Docker Entrypoint ]===-"
yarn db:migrate
yarn postdeploy
exec "$@"

