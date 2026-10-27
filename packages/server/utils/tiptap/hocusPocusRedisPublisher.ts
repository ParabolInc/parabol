import {
  type afterLoadDocumentPayload,
  type afterUnloadDocumentPayload,
  type Document,
  type Extension
} from '@hocuspocus/server'
import {unpack} from 'msgpackr'
import {SubscriptionChannel} from '../../../client/types/constEnums'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import publish from '../publish'
import type {PublicPageNotificationPayload} from '../publishPageNotification'
import RedisInstance from '../RedisInstance'
import {getPageConnectionAccess} from './getPageConnectionAccess'
import {isYjsSessionLive} from './isYjsSessionLive'
import {YJS_REVALIDATE_CHANNEL, type YjsRevalidation} from './revalidateYjsConnections'

export class RedisPublisher implements Extension {
  priority = 1001

  sub: RedisInstance

  documentConnections = new Map<string, Document>()

  public constructor() {
    this.sub = new RedisInstance('publicPage_sub')
    this.sub.subscribe(YJS_REVALIDATE_CHANNEL).catch(Logger.error)
    this.sub.on('messageBuffer', async (channel, message) => {
      try {
        const channelName = channel.toString()
        if (channelName === YJS_REVALIDATE_CHANNEL) {
          await this.revalidate(JSON.parse(message.toString()) as YjsRevalidation)
          return
        }
        const document = this.documentConnections.get(channelName)
        if (!document) return
        const payload = unpack(message) as PublicPageNotificationPayload<'UpdatePageAccessPayload'>
        const {data, subOptions, type, userIdsToIgnore} = payload
        document.getConnections().forEach((connection) => {
          const userId = connection.context.userId as string | undefined
          if (!userId || userIdsToIgnore.includes(userId)) return
          publish(SubscriptionChannel.NOTIFICATION, userId, type, data, subOptions)
        })
      } catch (e) {
        Logger.error(e)
      }
    })
  }

  private async revalidate({pageIds, userIds}: YjsRevalidation) {
    await Promise.all(
      Array.from(this.documentConnections, async ([channelName, document]) => {
        const pageId = Number(channelName.split(':')[1])
        const isTargetPage = pageIds.includes(pageId)
        const connections = document
          .getConnections()
          .filter((connection) => isTargetPage || userIds.includes(connection.context.userId))
        await Promise.all(
          connections.map(async (connection) => {
            const {userId, iat, exp, jti, connectedAt} = connection.context
            const isLive = !userId || (await isYjsSessionLive({userId, iat, exp, jti, connectedAt}))
            const access = isLive ? await getPageConnectionAccess(pageId, userId) : null
            if (!access || access.readOnly !== connection.readOnly) {
              connection.webSocket.close()
            }
          })
        )
      })
    )
  }

  private getChannelName(documentName: string) {
    const [dbId] = CipherId.fromClient(documentName)
    return `publicPage:${dbId}`
  }

  async afterLoadDocument({documentName, document}: afterLoadDocumentPayload) {
    if (!documentName.startsWith('page:')) return
    const channelName = this.getChannelName(documentName)
    this.sub.subscribe(channelName).catch(Logger.error)
    this.documentConnections.set(channelName, document)
  }

  async afterUnloadDocument({documentName}: afterUnloadDocumentPayload) {
    if (!documentName.startsWith('page:')) return
    const channelName = this.getChannelName(documentName)
    this.documentConnections.delete(channelName)
    await this.sub.unsubscribe(channelName)
  }
}
