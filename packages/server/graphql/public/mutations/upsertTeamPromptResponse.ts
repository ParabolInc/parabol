import {generateText, type JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isEmptyTipTapDoc from '../../../../client/shared/tiptap/isEmptyTipTapDoc'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'
import createTeamPromptMentionNotifications from './helpers/publishTeamPromptMentions'

const EMPTY_DOC = JSON.stringify({type: 'doc', content: []})

const upsertTeamPromptResponse: MutationResolvers['upsertTeamPromptResponse'] = async (
  _source,
  {meetingId, promptId, content},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const [meeting, prompts, viewerResponses] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('templatePromptsByMeetingId').load(meetingId),
    dataLoader.get('teamPromptResponsesByMeetingIdAndUserId').load({meetingId, userId: viewerId})
  ])
  if (!meeting || meeting.meetingType !== 'teamPrompt') throw new GraphQLError('Meeting not found')
  if (meeting.endedAt) throw new GraphQLError('Meeting already ended')
  if (!prompts.some(({id}) => id === promptId)) {
    throw new GraphQLError('Prompt is not part of this meeting')
  }

  let doc: JSONContent
  let isEmpty: boolean
  let plaintextContent: string
  try {
    doc = JSON.parse(content)
    isEmpty = isEmptyTipTapDoc(doc)
    plaintextContent = generateText(doc, serverTipTapExtensions).trim()
  } catch {
    throw new GraphQLError('Invalid editor format')
  }

  const values = isEmpty
    ? {content: EMPTY_DOC, plaintextContent: ''}
    : {content: JSON.stringify(doc), plaintextContent}
  const {id: responseId} = await getKysely()
    .insertInto('TeamPromptResponse')
    .values({meetingId, userId: viewerId, promptId, sortOrder: 0, ...values})
    .onConflict((oc) =>
      oc.columns(['meetingId', 'userId', 'promptId']).doUpdateSet((eb) => ({
        content: eb.ref('excluded.content'),
        plaintextContent: eb.ref('excluded.plaintextContent'),
        sharedAt: isEmpty ? null : sql`"TeamPromptResponse"."sharedAt"`
      }))
    )
    .returning('id')
    .executeTakeFirstOrThrow()

  dataLoader.clearAll('teamPromptResponses')
  const newResponse = await dataLoader.get('teamPromptResponses').loadNonNull(responseId)
  const oldResponse = viewerResponses.find(({id}) => id === responseId)
  if (newResponse.sharedAt) {
    const notifications = await createTeamPromptMentionNotifications(oldResponse, newResponse)
    notifications.forEach((notification) => {
      IntegrationNotifier.sendNotificationToUser?.(dataLoader, notification.id, notification.userId)
      publishNotification(notification, subOptions)
    })
  }

  const data = {meetingId, teamPromptResponseId: responseId}
  if (newResponse.sharedAt || oldResponse?.sharedAt) {
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpsertTeamPromptResponseSuccess',
      data,
      subOptions
    )
  }
  return data
}

export default upsertTeamPromptResponse
