#!/bin/sh

yarn install
yarn build
yarn postdeploy
exec "$@"