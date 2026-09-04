import {generateText, type JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import getTeamPromptMeetingPrompts from '../../mutations/helpers/getTeamPromptMeetingPrompts'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'
import buildTeamPromptResponseContent, {
  EMPTY_TIPTAP_DOC,
  isEmptyAnswerDoc
} from './helpers/buildTeamPromptResponseContent'
import publishNotification from './helpers/publishNotification'
import createTeamPromptMentionNotifications from './helpers/publishTeamPromptMentions'

const upsertTeamPromptAnswers: MutationResolvers['upsertTeamPromptAnswers'] = async (
  _source,
  {meetingId, answers, share},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const [meeting, viewer] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meeting || meeting.meetingType !== 'teamPrompt') {
    throw new GraphQLError('Meeting not found')
  }
  if (meeting.endedAt) {
    throw new GraphQLError('Meeting already ended')
  }
  const {teamId} = meeting
  if (!meeting.templateId) {
    throw new GraphQLError('Meeting does not use a template')
  }
  const prompts = await getTeamPromptMeetingPrompts(meeting, dataLoader)
  const promptIds = new Set(prompts.map(({id}) => id))
  const seenPromptIds = new Set<string>()
  const parsedAnswers = answers.map(({promptId, content}) => {
    if (!promptIds.has(promptId)) {
      throw new GraphQLError('Prompt is not part of this meeting')
    }
    if (seenPromptIds.has(promptId)) {
      throw new GraphQLError('Prompt was answered more than once')
    }
    seenPromptIds.add(promptId)
    let doc: JSONContent
    try {
      doc = JSON.parse(content)
    } catch {
      throw new GraphQLError('Invalid stringified JSON')
    }
    let plaintextContent: string
    try {
      plaintextContent = generateText(doc, serverTipTapExtensions).trim()
    } catch {
      throw new GraphQLError('Invalid editor format')
    }
    return {promptId, content: doc, plaintextContent, isEmpty: isEmptyAnswerDoc(doc)}
  })
  const answered = parsedAnswers.filter(({isEmpty}) => !isEmpty)
  const cleared = parsedAnswers.filter(({isEmpty}) => isEmpty)

  const existingResponses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
  const oldResponse = existingResponses.find((response) => response.userId === viewerId)
  const wasShared = oldResponse?.isShared ?? false
  if (wasShared && !share) {
    throw new GraphQLError('Response is already shared')
  }
  if (!oldResponse && !share && answered.length === 0) {
    throw new GraphQLError('Nothing to save')
  }

  const responseId = await pg.transaction().execute(async (trx) => {
    const {id: responseId} = await trx
      .insertInto('TeamPromptResponse')
      .values({
        meetingId,
        userId: viewerId,
        sortOrder: 0,
        content: JSON.stringify(EMPTY_TIPTAP_DOC),
        plaintextContent: '',
        isShared: false
      })
      .onConflict((oc) =>
        oc.columns(['meetingId', 'userId']).doUpdateSet({updatedAt: sql`CURRENT_TIMESTAMP`})
      )
      .returning('id')
      .executeTakeFirstOrThrow()
    if (answered.length > 0) {
      await trx
        .insertInto('TeamPromptResponseAnswer')
        .values(
          answered.map(({promptId, content, plaintextContent}) => ({
            responseId,
            promptId,
            content: JSON.stringify(content),
            plaintextContent
          }))
        )
        .onConflict((oc) =>
          oc.columns(['responseId', 'promptId']).doUpdateSet((eb) => ({
            content: eb.ref('excluded.content'),
            plaintextContent: eb.ref('excluded.plaintextContent')
          }))
        )
        .execute()
    }
    if (cleared.length > 0) {
      await trx
        .deleteFrom('TeamPromptResponseAnswer')
        .where('responseId', '=', responseId)
        .where(
          'promptId',
          'in',
          cleared.map(({promptId}) => promptId)
        )
        .execute()
    }
    const storedAnswers = await trx
      .selectFrom('TeamPromptResponseAnswer')
      .select(['promptId', 'content', 'plaintextContent'])
      .where('responseId', '=', responseId)
      .execute()
    if (share && storedAnswers.length === 0) {
      throw new GraphQLError('Answer at least one prompt to share')
    }
    const derived = buildTeamPromptResponseContent(
      prompts,
      storedAnswers.map((answer) => ({...answer, content: answer.content as JSONContent}))
    )
    await trx
      .updateTable('TeamPromptResponse')
      .set({
        content: JSON.stringify(derived.content),
        plaintextContent: derived.plaintextContent,
        ...(share ? {isShared: true, sharedAt: sql`COALESCE("sharedAt", CURRENT_TIMESTAMP)`} : {})
      })
      .where('id', '=', responseId)
      .execute()
    return responseId
  })

  dataLoader.clearAll(['teamPromptResponses', 'teamPromptResponseAnswers'])
  const newResponse = await dataLoader.get('teamPromptResponses').loadNonNull(responseId)
  const data = {meetingId, responseId}

  if (share) {
    const notifications = await createTeamPromptMentionNotifications(
      wasShared ? oldResponse : undefined,
      newResponse
    )
    notifications.forEach((notification) => {
      IntegrationNotifier.sendNotificationToUser?.(dataLoader, notification.id, notification.userId)
      publishNotification(notification, subOptions)
    })
    if (!wasShared) {
      IntegrationNotifier.standupResponseSubmitted(dataLoader, meetingId, teamId, viewerId)
    }
    analytics.responseAdded(viewer, meetingId, responseId, wasShared)
  }

  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpsertTeamPromptAnswersSuccess',
    data,
    subOptions
  )
  return data
}

export default upsertTeamPromptAnswers
