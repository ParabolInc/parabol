import tracer from 'dd-trace'
import {identityManager} from './utils/ServerIdentityManager'

tracer.init({
  service: `web`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: __APP_VERSION__,
  tags: {
    serverId: identityManager.getId()
  }
})
tracer
  .use('ioredis')
  .use('http', {
    blocklist: ['/health', '/ready']
  })
  .use('pg')
