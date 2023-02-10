#!/bin/sh

NODE_ENV=production yarn db:migrate
yarn pg:migrate up
yarn pg:build
yarn build
exec "$@"
