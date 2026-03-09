import {
  type afterLoadDocumentPayload,
  type afterUnloadDocumentPayload,
  type Document,
  type Extension
} from '@hocuspocus/server'
import {unpack} from 'msgpackr'
import {SubscriptionChannel} from '../../../client/types/constEnums'
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
    const publicId = Number(documentName.split(':')[1])
    return `publicPage:${publicId}`
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
