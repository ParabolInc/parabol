import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isEmptyTipTapDoc from '../../../../client/shared/tiptap/isEmptyTipTapDoc'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'
import createTeamPromptMentionNotifications from './helpers/publishTeamPromptMentions'

const shareTeamPromptResponses: MutationResolvers['shareTeamPromptResponses'] = async (
  _source,
  {meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const [meeting, viewerResponses] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('teamPromptResponsesByMeetingIdAndUserId').load({meetingId, userId: viewerId})
  ])
  if (!meeting || meeting.meetingType !== 'teamPrompt') throw new GraphQLError('Meeting not found')
  if (meeting.endedAt) throw new GraphQLError('Meeting already ended')
  const drafts = viewerResponses.filter(
    ({sharedAt, content}) => !sharedAt && !isEmptyTipTapDoc(content)
  )
  const hasSharedAnswer = viewerResponses.some(({sharedAt}) => !!sharedAt)
  if (drafts.length === 0 && !hasSharedAnswer) {
    throw new GraphQLError('Answer at least one prompt to share')
  }
  if (drafts.length > 0) {
    const updatedRows = await getKysely()
      .updateTable('TeamPromptResponse')
      .set({sharedAt: sql`CURRENT_TIMESTAMP`})
      .where(
        'id',
        'in',
        drafts.map(({id}) => id)
      )
      .where('sharedAt', 'is', null)
      .returning('id')
      .execute()
    dataLoader.clearAll('teamPromptResponses')
    const updatedIds = new Set(updatedRows.map(({id}) => id))
    const shared = drafts.filter(({id}) => updatedIds.has(id))
    if (shared.length > 0) {
      const notifications = (
        await Promise.all(
          shared.map((response) => createTeamPromptMentionNotifications(undefined, response))
        )
      ).flat()
      notifications.forEach((notification) => {
        IntegrationNotifier.sendNotificationToUser?.(
          dataLoader,
          notification.id,
          notification.userId
        )
        publishNotification(notification, subOptions)
      })
      const isFirstShare = viewerResponses.every(({sharedAt}) => !sharedAt)
      if (isFirstShare) {
        IntegrationNotifier.standupResponseSubmitted(
          dataLoader,
          meetingId,
          meeting.teamId,
          viewerId
        )
      }
    }
  }

  const data = {meetingId, userId: viewerId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'ShareTeamPromptResponsesSuccess',
    data,
    subOptions
  )
  return data
}

export default shareTeamPromptResponses
