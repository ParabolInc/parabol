import * as Integrations from '@sentry/integrations'
import * as Sentry from '@sentry/node'

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string
    }
  }
}

Sentry.init({
  environment: 'server',
  dsn: process.env.SENTRY_DSN,
  release: __APP_VERSION__,
  ignoreErrors: [
    '429 Too Many Requests',
    /language \S+ is not supported/,
    'Not invited to the meeting. Cannot subscribe'
  ],
  integrations: [
    new Integrations.RewriteFrames({
      root: (global as any).__rootdir__
    })
  ]
})
