import {generateText, JSONContent} from '@tiptap/core'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {upsertTeamPromptResponse as upsertTeamPromptResponseQuery} from '../../../postgres/queries/upsertTeamPromptResponses'
import {TeamPromptResponse} from '../../../postgres/types'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'
import createTeamPromptMentionNotifications from './helpers/publishTeamPromptMentions'
const upsertTeamPromptResponse: MutationResolvers['upsertTeamPromptResponse'] = async (
  _source,
  {teamPromptResponseId: inputTeamPromptResponseId, meetingId, content},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  let oldTeamPromptResponse: TeamPromptResponse | undefined

  // VALIDATION
  if (inputTeamPromptResponseId) {
    oldTeamPromptResponse = await dataLoader
      .get('teamPromptResponses')
      .load(TeamPromptResponseId.split(inputTeamPromptResponseId))
    if (!oldTeamPromptResponse) {
      return standardError(new Error('TeamPromptResponse not found'), {userId: viewerId})
    }
    const {userId, meetingId: responseMeetingId} = oldTeamPromptResponse
    if (userId !== viewerId) {
      return standardError(new Error("Can't edit other's response"), {userId: viewerId})
    }
    if (responseMeetingId !== meetingId) {
      return standardError(new Error("Can't edit response in another meeting"), {userId: viewerId})
    }
  }
  const [meeting, user] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  const {endedAt, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // RESOLUTION
  let contentJSON: JSONContent
  try {
    contentJSON = JSON.parse(content)
  } catch (e) {
    return standardError(new Error('Invalid stringified JSON'), {userId: viewerId})
  }

  let plaintextContent: string
  try {
    plaintextContent = generateText(contentJSON, serverTipTapExtensions)
  } catch (e) {
    return standardError(new Error('Invalid editor format'), {userId: viewerId})
  }

  const teamPromptResponseId = await upsertTeamPromptResponseQuery({
    meetingId,
    userId: viewerId,
    sortOrder: 0, //TODO: placeholder as currently it's defined as non-null. Might decide to remove the column entirely later.
    content,
    plaintextContent
  })

  dataLoader.get('teamPromptResponses').clear(teamPromptResponseId)

  const newTeamPromptResponse = await dataLoader
    .get('teamPromptResponses')
    .loadNonNull(teamPromptResponseId)

  const notifications = await createTeamPromptMentionNotifications(
    oldTeamPromptResponse,
    newTeamPromptResponse
  )

  const data = {
    meetingId,
    teamPromptResponseId,
    addedNotificationIds: notifications.map((notification) => notification.id)
  }

  notifications.forEach((notification) => {
    IntegrationNotifier.sendNotificationToUser?.(dataLoader, notification.id, notification.userId)
    publishNotification(notification, subOptions)
  })

  if (!oldTeamPromptResponse) {
    IntegrationNotifier.standupResponseSubmitted(dataLoader, meetingId, teamId, viewerId)
  }

  analytics.responseAdded(user, meetingId, teamPromptResponseId, !!inputTeamPromptResponseId)
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpsertTeamPromptResponseSuccess',
    data,
    subOptions
  )

  return data
}

export default upsertTeamPromptResponse
