import {generateText, JSONContent} from '@tiptap/core'
import {createEditorExtensions} from 'parabol-client/components/promptResponse/tiptapConfig'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {TeamPromptResponse} from '../../../postgres/queries/getTeamPromptResponsesByIds'
import {upsertTeamPromptResponse as upsertTeamPromptResponseQuery} from '../../../postgres/queries/upsertTeamPromptResponses'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'
import {getKudosUserIdsFromJson} from './helpers/getKudosUserIdsFromJson'
import publishNotification from './helpers/publishNotification'
import createTeamPromptMentionNotifications from './helpers/publishTeamPromptMentions'

const upsertTeamPromptResponse: MutationResolvers['upsertTeamPromptResponse'] = async (
  _source,
  {teamPromptResponseId: inputTeamPromptResponseId, meetingId, content},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  let oldTeamPromptResponse: TeamPromptResponse | undefined

  // VALIDATION
  if (inputTeamPromptResponseId) {
    oldTeamPromptResponse = await dataLoader
      .get('teamPromptResponses')
      .load(inputTeamPromptResponseId)
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
    plaintextContent = generateText(contentJSON, createEditorExtensions())
  } catch (e) {
    return standardError(new Error('Invalid editor format'), {userId: viewerId})
  }

  const teamPromptResponseId = TeamPromptResponseId.join(
    await upsertTeamPromptResponseQuery({
      meetingId,
      userId: viewerId,
      sortOrder: 0, //TODO: placeholder as currently it's defined as non-null. Might decide to remove the column entirely later.
      content,
      plaintextContent
    })
  )

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {kudosEmoji, kudosEmojiUnicode} = team

  let insertedKudoses:
    | {
        id: number
        receiverUserId: string
        emoji: string | null
        emojiUnicode: string
      }[]
    | null = null
  if (team.giveKudosWithEmoji && kudosEmojiUnicode) {
    const oldKudosUserIds = oldTeamPromptResponse
      ? getKudosUserIdsFromJson(oldTeamPromptResponse.content, kudosEmojiUnicode)
      : []
    const newKudosUserIds = getKudosUserIdsFromJson(contentJSON, kudosEmojiUnicode)
    const kudosUserIds = newKudosUserIds.filter(
      (userId) => !oldKudosUserIds.includes(userId) && userId !== viewerId
    )
    if (kudosUserIds.length) {
      const kudosRows = kudosUserIds.map((userId) => ({
        senderUserId: viewerId,
        receiverUserId: userId,
        teamId,
        emoji: kudosEmoji,
        emojiUnicode: kudosEmojiUnicode,
        teamPromptResponseId: TeamPromptResponseId.split(teamPromptResponseId)
      }))

      insertedKudoses = await pg
        .insertInto('Kudos')
        .values(kudosRows)
        .returning(['id', 'receiverUserId', 'emoji', 'emojiUnicode'])
        .execute()

      insertedKudoses.forEach((kudos) => {
        analytics.kudosSent(user, teamId, kudos.id, kudos.receiverUserId, 'mention', 'teamPrompt')
      })
    }
  }

  dataLoader.get('teamPromptResponses').clear(teamPromptResponseId)

  const newTeamPromptResponse = await dataLoader
    .get('teamPromptResponses')
    .loadNonNull(teamPromptResponseId)

  const notifications = await createTeamPromptMentionNotifications(
    oldTeamPromptResponse,
    newTeamPromptResponse,
    insertedKudoses
  )

  const data = {
    meetingId,
    teamPromptResponseId,
    addedNotificationIds: notifications.map((notification) => notification.id),
    addedKudosesIds: insertedKudoses?.map((row) => row.id)
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
