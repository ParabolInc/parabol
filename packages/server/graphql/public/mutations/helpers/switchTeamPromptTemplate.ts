import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../../../postgres/getKysely'
import {selectTeamPromptResponses} from '../../../../postgres/select'
import type {TeamPromptMeeting} from '../../../../postgres/types/Meeting'
import {escapeHtml} from '../../../../utils/escapeHtml'
import getPhase from '../../../../utils/getPhase'
import publish from '../../../../utils/publish'
import {generateJSON} from '../../../../utils/tiptap/generateJSON'
import type {DataLoaderWorker} from '../../../graphql'
import {createAIComment} from '../../../mutations/helpers/addAIGeneratedContentToThreads'

interface Options {
  meeting: TeamPromptMeeting
  templateId: string
  templateName: string
  applyToSeries: boolean
  clearResponses: boolean
  dataLoader: DataLoaderWorker
  operationId: string
}

const switchTeamPromptTemplate = async (options: Options) => {
  const {meeting, templateId, templateName, applyToSeries, clearResponses, dataLoader} = options
  const {id: meetingId, meetingSeriesId, phases} = meeting
  const [responses, oldTemplate, series] = await Promise.all([
    selectTeamPromptResponses().where('meetingId', '=', meetingId).execute(),
    dataLoader.get('meetingTemplates').load(meeting.templateId),
    meetingSeriesId ? dataLoader.get('meetingSeries').load(meetingSeriesId) : null
  ])
  const answeredUserIds = new Set(
    responses.filter(({plaintextContent}) => plaintextContent.trim()).map(({userId}) => userId)
  )
  const answeredCount = answeredUserIds.size
  if (answeredCount > 0 && !clearResponses) {
    throw new GraphQLError(
      answeredCount === 1
        ? '1 person has started answering'
        : `${answeredCount} people have started answering`,
      {extensions: {code: 'CONFLICT', answeredCount}}
    )
  }

  const {stages} = getPhase(phases, 'RESPONSES')
  const answeredStages = stages.filter(({teamMemberId}) =>
    answeredUserIds.has(fromTeamMemberId(teamMemberId).userId)
  )
  const discussionIds = answeredStages.map(({discussionId}) => discussionId)
  const [commentsByDiscussion, tasksByDiscussion] = await Promise.all([
    dataLoader.get('commentsByDiscussionId').loadMany(discussionIds),
    dataLoader.get('tasksByDiscussionId').loadMany(discussionIds)
  ])
  const noteText = `The template changed from ${oldTemplate?.name ?? 'the previous template'} to ${templateName}, so the answer these replies were about was cleared.`
  const noteContent = generateJSON(`<p>${escapeHtml(noteText)}</p>`, serverTipTapExtensions)
  const notes = discussionIds.flatMap((discussionId, idx) => {
    const comments = commentsByDiscussion[idx]
    const tasks = tasksByDiscussion[idx]
    if (!comments || !tasks || comments instanceof Error || tasks instanceof Error) return []
    const replies = [...comments.filter(({isActive}) => isActive), ...tasks]
    if (replies.length === 0) return []
    const threadSortOrder = Math.max(0, ...replies.map((reply) => reply.threadSortOrder ?? 0)) + 1
    return [createAIComment(discussionId, noteContent, threadSortOrder)]
  })

  const isSeriesActive = !!series && !series.cancelledAt
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      await trx.deleteFrom('TeamPromptResponse').where('meetingId', '=', meetingId).execute()
      await trx
        .updateTable('NewMeeting')
        .set({templateId, templateChosenAt: sql`now()`})
        .where('id', '=', meetingId)
        .execute()
      if (applyToSeries && isSeriesActive) {
        await trx
          .updateTable('MeetingSeries')
          .set({templateId})
          .where('id', '=', series.id)
          .execute()
      }
      if (notes.length > 0) {
        await trx.insertInto('Comment').values(notes).execute()
      }
    })
  dataLoader.clearAll(['teamPromptResponses', 'comments', 'meetingSeries'])
  notes.forEach(({id: commentId}) => {
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'AddCommentSuccess',
      {commentId, meetingId},
      {operationId: options.operationId}
    )
  })
}

export default switchTeamPromptTemplate
