import tracer from 'dd-trace'

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
