#!/bin/sh
set -e
echo "-===[ Parabol Action Docker Entrypoint ]===-"
yarn && yarn db:migrate && yarn build:relay && yarn dev
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
   set -- node "$@"
 fi

exec "$@"