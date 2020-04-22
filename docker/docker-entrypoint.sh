#!/bin/sh
set -e
echo "-===[ Parabol Action Docker Entrypoint ]===-"

if [ "$TARGET_ENV" = "dev" ]; then
   yarn && yarn db:migrate && yarn build:relay && yarn dev
   tail -f /dev/null #running continuously; you can stop/start/rebuild yarn   
elif [ $TARGET_ENV == "prod" ]; then
   yarn && yarn workspace parabol-server db:migrate && yarn build && yarn workspace parabol-server postdeploy && yarn start
   if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
      set -- node "$@"
   fi
   exec "$@" #If the process goes down the docker stop (or restart on k8s)
else 
   tail -f /dev/null
fi