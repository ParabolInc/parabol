import * as Sentry from '@sentry/node'
import tracer from 'dd-trace'

Sentry.init({
  environment: 'server',
  dsn: process.env.SENTRY_DSN,
  release: __APP_VERSION__,
  defaultIntegrations: false,
  ignoreErrors: [
    '429 Too Many Requests',
    /language \S+ is not supported/,
    'Not invited to the meeting. Cannot subscribe'
  ]
})

tracer.init({
  service: `web`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: __APP_VERSION__
})
tracer
  .use('ioredis')
  .use('http', {
    blocklist: ['/health', '/ready']
  })
  .use('pg')
