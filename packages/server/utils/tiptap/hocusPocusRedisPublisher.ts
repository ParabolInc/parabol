import {
  type afterLoadDocumentPayload,
  type afterUnloadDocumentPayload,
  type Document,
  type Extension
} from '@hocuspocus/server'
import {unpack} from 'msgpackr'
import {SubscriptionChannel} from '../../../client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import publish from '../publish'
import type {PublicPageNotificationPayload} from '../publishPageNotification'
import RedisInstance from '../RedisInstance'

export class RedisPublisher implements Extension {
  priority = 1001

  sub: RedisInstance

  documentConnections = new Map<string, Document>()

  public constructor() {
    this.sub = new RedisInstance('publicPage_sub')
    this.sub.on('messageBuffer', async (channel, message) => {
      const document = this.documentConnections.get(channel.toString())
      if (!document) {
        return
      }

      const payload = unpack(message) as PublicPageNotificationPayload<'UpdatePageAccessPayload'>
      const {data, subOptions, type, userIdsToIgnore} = payload
      document.connections.forEach(({connection}) => {
        const userId = connection.context.userId as string | undefined
        if (!userId || userIdsToIgnore.includes(userId)) return
        publish(SubscriptionChannel.NOTIFICATION, userId, type, data, subOptions)
      })

      if (type === 'UpdatePageAccessPayload') {
        const connectedUserIds = [...document.connections.values()]
          .map(({connection}) => connection.context.userId as string | undefined)
          .filter((userId): userId is string => !!userId)

        if (connectedUserIds.length > 0) {
          const [dbId] = CipherId.fromClient(document.name)
          const pg = getKysely()
          const accessRecords = await pg
            .selectFrom('PageAccess')
            .select(['userId', 'role'])
            .where('pageId', '=', dbId)
            .where('userId', 'in', connectedUserIds)
            .execute()
          const roleByUserId = new Map(accessRecords.map(({userId, role}) => [userId, role]))
          document.connections.forEach(({connection}) => {
            const userId = connection.context.userId as string | undefined
            const role = userId ? roleByUserId.get(userId) : undefined
            const newReadOnly = role === 'viewer' || role === 'commenter'
            if (!role || connection.readOnly !== newReadOnly) {
              connection.webSocket.close()
            }
          })
        }
      }
    })
  }

  private getChannelName(documentName: string) {
    const [dbId] = CipherId.fromClient(documentName)
    return `publicPage:${dbId}`
  }

  async afterLoadDocument({documentName, document}: afterLoadDocumentPayload) {
    const channelName = this.getChannelName(documentName)
    this.sub.subscribe(channelName)
    this.documentConnections.set(channelName, document)
  }

  async afterUnloadDocument({documentName}: afterUnloadDocumentPayload) {
    const channelName = this.getChannelName(documentName)
    await this.sub.unsubscribe(channelName)
    this.documentConnections.delete(channelName)
  }
}
