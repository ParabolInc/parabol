import {SlackNotificationEventEnum as EventEnum} from '../../../../database/types/SlackNotification'
import MattermostServerManager from '../../../../utils/MattermostServerManager'
import segmentIo from '../../../../utils/segmentIo'
import sendToSentry from '../../../../utils/sendToSentry'
import {makeFieldsAttachment} from './makeMattermostAttachments'

const notifyMattermost = async (
  event: EventEnum,
  webhookUrl: string,
  userId: string,
  teamId: string,
  textOrAttachmentsArray: string | unknown[],
  notificationText?: string
) => {
  const manager = new MattermostServerManager(webhookUrl)
  const result = await manager.postMessage(textOrAttachmentsArray, notificationText)
  if (result instanceof Error) {
    sendToSentry(result, {userId, tags: {teamId, event, webhookUrl}})
    return result
  }
  segmentIo.track({
    userId,
    event: 'Mattermost notification sent',
    properties: {
      teamId,
      notificationEvent: event
    }
  })

  return result
}

export const notifyWebhookConfigUpdated = async (
  webhookUrl: string,
  userId: string,
  teamId: string
) => {
  const message = `Integration webhook configuration updated`

  const attachments = [
    makeFieldsAttachment(
      [
        {
          short: false,
          value: message
        }
      ],
      {
        fallback: message
      }
    )
  ]
  return notifyMattermost('meetingEnd', webhookUrl, userId, teamId, attachments)
}
