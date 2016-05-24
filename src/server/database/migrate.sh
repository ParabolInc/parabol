#!/bin/bash

## Script constants:
PWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJROOT="${PWD}/../../.."
NMB="${PROJROOT}/node_modules/.bin"
BABEL_NODE="${NMB}/babel-node"
RETHINK_MIGRATE="${NMB}/rethink-migrate"

## Script defaults
if [[ -z "${RETHINKDB_URL// }" ]]; then
  RETHINKDB_URL="rethinkdb://localhost:28015/actionDevelopment"
fi


## Import .env
if [ -e ${PROJROOT}/.env ]; then
    source ${PROJROOT}/.env
fi

## Parse command-line arguments:

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

## Parse RETHINKDB_URL:
if [[ ${RETHINKDB_URL} =~ rethinkdb://([^:]+):([0-9]+)/(.*)/? ]]; then
  RETHINKDB_HOST=${BASH_REMATCH[1]}
  RETHINKDB_PORT=${BASH_REMATCH[2]}
  RETHINKDB_NAME=${BASH_REMATCH[3]}
  if [[ -z "${RETHINKDB_NAME// }" ]]; then
    RETHINKDB_NAME="actionDevelopment"
  fi
else
  echo "Error: unable to base RETHINKDB_URL (have: \"${RETHINKDB_URL})\")"
  exit -1
fi

${BABEL_NODE} ${RETHINK_MIGRATE} ${MIGRATE_ARGS} -a \
  --host $RETHINKDB_HOST --port $RETHINKDB_PORT \
  --db $RETHINKDB_NAME -r ${PWD}
