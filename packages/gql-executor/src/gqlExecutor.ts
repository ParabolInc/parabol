import Redis from 'ioredis'
import {ServerChannel} from 'parabol-client/lib/types/constEnums'
import hotSwap from 'parabol-server/lib/hotSwap'
import makeLiveReloadable from 'parabol-server/lib/makeLiveReloadable'
import PROD from 'parabol-server/lib/PROD'
import path from 'path'

const publisher = new Redis(process.env.REDIS_URL)
const subscriber = new Redis(process.env.REDIS_URL)

// imports go here because in dev we make them hot but in prod we want them fast
const reloadable = makeLiveReloadable(__dirname, {
  executeGraphQL: 'parabol-server/lib/graphql/executeGraphQL'
})

if (!PROD) {
  // directories to watch for changes. doesn't include client for performance reasons
  hotSwap([path.join(__dirname, '../src'), path.join(__dirname, '../../server/src')])
}

const onMessage = async (_channel: string, message: string) => {
  const payload = JSON.parse(message)
  const result = await reloadable.executeGraphQL(payload)
  publisher.publish(
    ServerChannel.GQL_EXECUTOR_RESPONSE,
    JSON.stringify({...result, jobId: payload.jobId})
  )
}

subscriber.on('message', onMessage)
subscriber.subscribe(ServerChannel.GQL_EXECUTOR_REQUEST)
console.log(`\n💧💧💧Ready for GraphQL Execution💧💧💧`)
