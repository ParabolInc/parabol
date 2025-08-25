import {
  type afterLoadDocumentPayload,
  type afterUnloadDocumentPayload,
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

  public constructor() {
    this.sub = new RedisInstance('publicPage_sub')
  }

  private getChannelName(documentName: string) {
    const [dbId] = CipherId.fromClient(documentName)
    return `publicPage:${dbId}`
  }
  async afterLoadDocument({documentName, document}: afterLoadDocumentPayload) {
    this.sub.subscribe(this.getChannelName(documentName))
    this.sub.on('messageBuffer', (_channel, message) => {
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

  async afterUnloadDocument({documentName}: afterUnloadDocumentPayload) {
    await this.sub.unsubscribe(this.getChannelName(documentName))
  }
}
