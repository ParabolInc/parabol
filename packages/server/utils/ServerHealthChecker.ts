import Redis from 'ioredis'
import sleep from '../../client/utils/sleep'
import ServerAuthToken from '../database/types/ServerAuthToken'
import {UserPresence} from '../graphql/private/mutations/connectSocket'
import {disconnectQuery} from '../socketHandlers/handleDisconnect'
import publishInternalGQL from './publishInternalGQL'
import sendToSentry from './sendToSentry'

const REDIS_URL = process.env.REDIS_URL!
const SERVER_ID = process.env.SERVER_ID!

export default class ServerHealthChecker {
  publisher = new Redis(REDIS_URL, {connectionName: 'serverHealth_pub'})
  subscriber = new Redis(REDIS_URL, {connectionName: 'serverHealth_sub'})
  pendingPongs: null | Set<string> = null
  constructor() {
    this.subscriber.on('message', (channel, remoteServerId) => {
      if (channel === 'socketServerPing') {
        if (remoteServerId === SERVER_ID) return
        this.publisher.publish(`socketServerPong:${remoteServerId}`, SERVER_ID)
      } else if (channel === `socketServerPong:${SERVER_ID}`) {
        this.pendingPongs?.delete(remoteServerId)
      }
    })
    this.subscriber.subscribe('socketServerPing', `socketServerPong:${SERVER_ID}`)
    this.publisher.sadd('socketServers', SERVER_ID)
  }

  // get a list of servers who should be alive
  // ping all servers
  // if there are servers who say they're alive but they have responded, flag them as dead
  async ping() {
    if (this.pendingPongs) return
    this.pendingPongs = new Set()
    const socketServers = await this.publisher.smembers('socketServers')
    this.pendingPongs = new Set(...socketServers.filter((id) => id !== SERVER_ID))
    await this.publisher.publish('socketServerPing', SERVER_ID)
    await sleep(500)
    // if a server hasn't replied in 500ms, assume it is offline
    const deadServerIds = [...this.pendingPongs]
    await this.reportDeadServers(deadServerIds)
    this.pendingPongs = null
  }

  async reportDeadServers(deadServerIds: string[]) {
    if (deadServerIds.length === 0) return
    const authToken = new ServerAuthToken()
    // remove the dead servers from the set of socket servers in redis
    await this.publisher.srem('socketServers', deadServerIds)
    // find all connected users and prune the dead servers from their list of connections
    const userPresenceStream = this.publisher.scanStream({match: 'presence:*'})
    userPresenceStream.on('data', async (keys) => {
      if (!keys?.length) return
      const reads = keys.map((key: string) => {
        return ['lrange', key, '0', '-1']
      }) as string[][]
      userPresenceStream.pause()

      const presenceBatch = (await this.publisher.multi(reads).exec()) as [null, string[]][]
      await Promise.all(
        presenceBatch.flatMap((record, idx) => {
          const key = keys[idx]!
          const userId = key.slice(key.indexOf(':') + 1)
          const connections = record[1]
          return connections.map((connection) => {
            const presence = JSON.parse(connection) as UserPresence
            const {socketServerId, socketId} = presence
            if (!deadServerIds.includes(socketServerId)) return
            // let GQL handle the disconnect logic so it can do special handling like notify team memers
            return publishInternalGQL({
              authToken,
              query: disconnectQuery,
              socketId,
              variables: {userId}
            })
          })
        })
      )
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
