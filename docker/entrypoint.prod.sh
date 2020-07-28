#!/bin/sh

yarn install
yarn build
exec "$@"