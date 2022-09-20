import Redis from 'ioredis'
import sleep from '../../client/utils/sleep'
import ServerAuthToken from '../database/types/ServerAuthToken'
import {UserPresence} from '../graphql/private/mutations/connectSocket'
import {disconnectQuery} from '../socketHandlers/handleDisconnect'
import publishInternalGQL from './publishInternalGQL'
import sendToSentry from './sendToSentry'

const REDIS_URL = process.env.REDIS_URL!
const SERVER_ID = process.env.SERVER_ID!

// When a socket server starts up, it d
export default class ServerHealthChecker {
  publisher = new Redis(REDIS_URL, {connectionName: 'serverHealth_pub'})
  subscriber = new Redis(REDIS_URL, {connectionName: 'serverHealth_sub'})
  pendingPongs = new Set<string>()
  constructor() {
    this.subscriber.on('message', (_channel, message) => {
      this.pendingPongs.delete(message)
    })
    this.subscriber.subscribe(`socketServerPong:${SERVER_ID}`)
    this.publisher.sadd('socketServers', SERVER_ID)
  }
  async ping() {
    const socketServers = await this.publisher.smembers('socketServers')
    this.pendingPongs = new Set(...socketServers.filter((id) => id !== SERVER_ID))
    this.publisher.publish('socketServerPing', SERVER_ID)
    await sleep(500)
    // if a server hasn't replied in 500ms, assume it is offline
    const deadServerIds = [...this.pendingPongs]
    await this.reportDeadServers(deadServerIds)
    return deadServerIds
  }

  async reportDeadServers(deadServerIds: string[]) {
    if (deadServerIds.length === 0) return
    const authToken = new ServerAuthToken()
    // remove the dead servers from the set of socket servers in redis
    const writes = deadServerIds.map((id) => ['srem', 'socketServers', id])
    await this.publisher.multi(writes).exec()
    // find all connected users and prune the dead servers from their list of connections
    const userPresenceStream = this.publisher.scanStream({match: 'presence:*'})
    userPresenceStream.on('data', async (keys) => {
      if (!keys?.length) return
      const reads = keys.map((key: string) => {
        return ['lrange', key, '0', '-1']
      })
      userPresenceStream.pause()

      const presenceBatch = (await this.publisher.multi(reads).exec()) as [null, string[]][]
      presenceBatch.map((record, idx) => {
        const key = keys[idx]!
        const userId = key.slice(0, key.indexOf(':'))
        const connections = record[1]
        connections.forEach((connection) => {
          const presence = JSON.parse(connection) as UserPresence
          const {socketServerId, socketId} = presence
          if (!deadServerIds.includes(socketServerId)) return
          // let GQL handle the disconnect logic so it can do special handling like notify team memers
          publishInternalGQL({authToken, query: disconnectQuery, socketId, variables: {userId}})
        })
      })

      userPresenceStream.resume()
    })
    await new Promise((resolve, reject) => {
      userPresenceStream.on('end', resolve)
      userPresenceStream.on('error', (e) => {
        sendToSentry(e)
        reject(e)
      })
    })
  }
}
