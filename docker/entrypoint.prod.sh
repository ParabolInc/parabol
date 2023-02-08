#!/bin/sh

yarn db:migrate
yarn pg:migrate up
yarn pg:build
yarn postdeploy
exec "$@"
