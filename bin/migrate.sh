#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATE="${DIR}/../node_modules/.bin/rethink-migrate"

development ()
{
  source ${DIR}/../config/env/development.sh
}

production ()
{
  source ${DIR}/../config/env/production.sh
}

case $NODE_ENV in
development)
  echo "node development environment found"
  development
  ;;
production)
  echo "node production environment found"
  production
  ;;
*)
  echo "defaulting to node development environment"
  development
  ;;
esac

case $1 in
down)
  echo "will migrate down one"
  MIGRATE_ARGS="down"
  ;;
down-all)
  echo "will migrate down all"
  MIGRATE_ARGS="down -a"
  ;;
up)
  echo "will migrate up one"
  MIGRATE_ARGS="up"
  ;;
up-all)
  echo "will migrate up all"
  MIGRATE_ARGS="up -a"
  ;; # no fallthough in bash < 4.0
*)
  echo "will migrate up all"
  MIGRATE_ARGS="up -a"
  ;;
esac

${MIGRATE} ${MIGRATE_ARGS} -a --host $RETHINK_DB_HOST --port $RETHINK_DB_PORT \
  --db $RETHINK_DB_NAME -r ${DIR}/../api/models/
  
