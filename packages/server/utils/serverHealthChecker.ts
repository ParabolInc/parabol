import sleep from '../../client/utils/sleep'
import ServerAuthToken from '../database/types/ServerAuthToken'
import {UserPresence} from '../graphql/private/mutations/connectSocket'
import {disconnectQuery} from '../socketHandlers/handleDisconnect'
import RedisInstance from './RedisInstance'
import publishInternalGQL from './publishInternalGQL'
import sendToSentry from './sendToSentry'

const SERVER_ID = process.env.SERVER_ID!
const INSTANCE_ID = `${SERVER_ID}:${process.pid}`

class ServerHealthChecker {
  private publisher = new RedisInstance('serverHealth_pub')
  private subscriber = new RedisInstance('serverHealth_sub')
  private remoteSocketServers: null | string[] = null
  private joinPoolPromise: null | Promise<void> = null
  private async joinPool() {
    if (!this.joinPoolPromise) {
      this.joinPoolPromise = (async () => {
        await this.subscriber.subscribe('socketServerPing', `socketServerPong:${INSTANCE_ID}`)
        this.subscriber.on('message', (channel, remoteServerId) => {
          if (channel === 'socketServerPing') {
            if (remoteServerId === INSTANCE_ID) return
            this.publisher.publish(`socketServerPong:${remoteServerId}`, INSTANCE_ID)
          } else if (channel === `socketServerPong:${INSTANCE_ID}`) {
            if (!this.remoteSocketServers) {
              console.error('unsolicited pong received before getLivingServers was called')
            } else {
              this.remoteSocketServers.push(remoteServerId)
            }
          }
        })
      })()
    }
    return this.joinPoolPromise
  }

  async getLivingServers() {
    await this.joinPool()
    this.remoteSocketServers = []
    await this.publisher.publish('socketServerPing', INSTANCE_ID)
    await sleep(500)
    const socketServers = [INSTANCE_ID, ...this.remoteSocketServers]
    this.remoteSocketServers = null
    return socketServers
  }

  async cleanUserPresence() {
    const socketServers = await this.getLivingServers()
    const authToken = new ServerAuthToken()

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
            const {socketInstanceId, socketId} = presence
            if (socketServers.includes(socketInstanceId)) return
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

// singleton because the same server should not subscribe to the same channels more than once
export default new ServerHealthChecker()
