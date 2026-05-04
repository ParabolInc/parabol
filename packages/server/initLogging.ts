import tracer from 'dd-trace'

// dd-trace must be pinned to v5.67.0 see https://github.com/ParabolInc/parabol/pull/12447
tracer.init({
  service: `web`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: __APP_VERSION__,
  tags: {
    serverId: process.env.SERVER_ID
  }
})
tracer
  .use('ioredis')
  .use('http', {
    blocklist: ['/health', '/ready']
  })
  .use('pg')
