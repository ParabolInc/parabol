#!/bin/sh

ARCH=$(docker info -f "{{.Architecture}}")

case $ARCH in
  aarch64)
    echo 'PGADMIN_PLATFORM="linux/arm64/v8"'
    echo 'REDIS_COMMANDER_PLATFORM="linux/amd64"'
    echo 'REDIS_PLATFORM="linux/arm64/v8"'
    ;;
  *)
    echo 'PGADMIN_PLATFORM="linux/amd64"'
    echo 'REDIS_COMMANDER_PLATFORM="linux/amd64"'
    echo 'REDIS_PLATFORM="linux/x86_64"'
    ;;
esac

