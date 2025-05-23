#!/bin/bash

nvm use 22.14
cp .env.example .env
pnpm i
# Start docker manually - docker daemon should be running
pnpm db:start
pnpm relay:build
pnpm dev 2>&1 | tee .workback/dev_environment.log
