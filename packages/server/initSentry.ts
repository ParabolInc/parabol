import * as Sentry from '@sentry/node'

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
