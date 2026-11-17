#!/usr/bin/env bash
# The setup action starts Postgres without waiting for it, so the wait happens here, where a job can put it in the background
set -euo pipefail

deadline=$((SECONDS + 60))
# The image starts a server on a unix socket to initialize the database, then restarts it. Only the final one listens on TCP
until docker exec postgres pg_isready --host 127.0.0.1 --quiet 2> /dev/null; do
  if ((SECONDS > deadline)); then
    echo 'Postgres did not start within 60 seconds'
    cat "$RUNNER_TEMP/postgres.log"
    docker logs postgres
    exit 1
  fi
  sleep 0.2
done

pnpm kysely migrate:latest
