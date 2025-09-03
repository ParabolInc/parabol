import {
  type afterLoadDocumentPayload,
  type afterUnloadDocumentPayload,
  type Document,
  type Extension
} from '@hocuspocus/server'
import {unpack} from 'msgpackr'
import {SubscriptionChannel} from '../../../client/types/constEnums'
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
    this.sub.on('messageBuffer', (channel, message) => {
      const document = this.documentConnections.get(channel.toString())
      if (!document) {
        return
      }

      const payload = unpack(message) as PublicPageNotificationPayload
      const {data, subOptions, type, userIdsToIgnore} = payload
      document.connections.forEach(({connection}) => {
        const {context} = connection
        const userId = context.userId as string | undefined
        if (!userId || userIdsToIgnore.includes(userId)) return
        publish(SubscriptionChannel.NOTIFICATION, userId, type, data, subOptions)
      })
    })
  }

  private getChannelName(documentName: string) {
    const [dbId] = CipherId.fromClient(documentName)
    return `publicPage:${dbId}`
  }
  async afterLoadDocument({documentName, document}: afterLoadDocumentPayload) {
    this.sub.subscribe(this.getChannelName(documentName))
    this.documentConnections.set(this.getChannelName(documentName), document)
  }

  async afterUnloadDocument({documentName}: afterUnloadDocumentPayload) {
    await this.sub.unsubscribe(this.getChannelName(documentName))
    this.documentConnections.delete(this.getChannelName(documentName))
  }
}
