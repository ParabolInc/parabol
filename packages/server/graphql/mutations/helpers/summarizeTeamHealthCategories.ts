import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import sleep from '../../../../client/utils/sleep'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import {escapeHtml} from '../../../utils/escapeHtml'
import getPhase from '../../../utils/getPhase'
import logError from '../../../utils/logError'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import type {DataLoaderWorker} from '../../graphql'
import {buildCommentContentBlock, createAIComment} from './addAIGeneratedContentToThreads'
import getTeamHealthCategorySummaryInput from './getTeamHealthCategorySummaryInput'
import {PENDING_PARAPHRASE} from './paraphraseTeamHealthResponse'

const PARAPHRASE_WAIT = ms('30s')
const PARAPHRASE_POLL = ms('2s')

// an anonymous comment left just before the reveal can still be getting reworded, so wait a little
// for it rather than summarize without it, then read whatever is ready
const waitForParaphrases = async (meetingId: string) => {
  const giveUpAt = Date.now() + PARAPHRASE_WAIT
  while (Date.now() < giveUpAt) {
    const pending = await getKysely()
      .selectFrom('TeamHealthResponse')
      .select('id')
      .where('meetingId', '=', meetingId)
      .where('isAnonymous', '=', true)
      .where('commentParaphrased', '=', PENDING_PARAPHRASE)
      .limit(1)
      .executeTakeFirst()
    if (!pending) return
    await sleep(PARAPHRASE_POLL)
  }
}

// a subscriber resolves a message without an operationId against the dataloader its socket used
// last, which can be the reveal's, still caching these rows as loading. Each message brings its own
// fresh dataloader instead, since every message under one operationId reads the first one's snapshot
const publishFresh = (meetingId: string, type: string, payload: Record<string, unknown>) => {
  const dataLoader = getNewDataLoader('summarizeTeamHealthCategories.publish')
  publish(SubscriptionChannel.MEETING, meetingId, type, payload, {operationId: dataLoader.share()})
  dataLoader.dispose()
}

const publishSummary = (meetingId: string, categoryId: number) => {
  publishFresh(meetingId, 'TeamHealthCategorySummarySuccess', {meetingId, categoryId})
}

const addConversationStarter = async (
  meetingId: string,
  discussionId: string,
  discussionQuestion: string,
  dataLoader: DataLoaderWorker
) => {
  const existingComments = await dataLoader.get('commentsByDiscussionId').load(discussionId)
  const threadSortOrder =
    Math.max(0, ...existingComments.map((comment) => comment.threadSortOrder)) + 1
  const comment = createAIComment(
    discussionId,
    buildCommentContentBlock('🤖 Conversation starter', `<p>${escapeHtml(discussionQuestion)}</p>`),
    threadSortOrder
  )
  await getKysely().insertInto('Comment').values(comment).execute()
  publishFresh(meetingId, 'AddCommentSuccess', {commentId: comment.id, meetingId})
}

const logSummaryError = (meetingId: string, e: unknown) => {
  logError(e instanceof Error ? e : new Error(`summarizeTeamHealthCategories failed: ${e}`), {
    tags: {meetingId, op: 'summarizeTeamHealthCategories'}
  })
}

/**
 * Writes the AI summary of each category queueTeamHealthCategorySummaries queued for a check that
 * was just revealed, and opens the category's discussion with the question the model asked in the
 * same call. Detached from the reveal, which never waits on the model. Each summary is published as
 * it lands so open result cards pick it up, and every queued row is finished on the way out:
 * written, or removed when no summary came of it.
 */
const summarizeTeamHealthCategories = async (meetingId: string) => {
  const dataLoader = getNewDataLoader('summarizeTeamHealthCategories')
  const pg = getKysely()
  try {
    const queued = await dataLoader.get('teamHealthCategorySummariesByMeetingId').load(meetingId)
    const queuedCategoryIds = new Set(
      queued.flatMap(({categoryId, summary}) => (summary === null ? [categoryId] : []))
    )
    if (queuedCategoryIds.size === 0) return
    await waitForParaphrases(meetingId)
    const [meeting, responses, priorCycles] = await Promise.all([
      dataLoader.get('newMeetings').loadNonNull(meetingId),
      dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId),
      dataLoader.get('priorTeamHealthCyclesByMeetingId').load(meetingId)
    ])
    if (meeting.meetingType !== 'teamHealth') return
    const manager = new OpenAIServerManager()
    const resultStages = getPhase(meeting.phases, 'TEAM_HEALTH_RESULT').stages
    const stageResults = await Promise.allSettled(
      resultStages.map(async ({questionId, discussionId}) => {
        const question = await dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
        const {categoryId} = question
        if (!queuedCategoryIds.has(categoryId)) return
        const category = await dataLoader.get('teamHealthCategories').loadNonNull(categoryId)
        const input = getTeamHealthCategorySummaryInput({
          category,
          question: question.question,
          responses: responses.filter((response) => response.questionId === questionId),
          priorCycles
        })
        const result = input && (await manager.generateTeamHealthCategorySummary(input))
        if (!result) return
        const {summary, sentimentScore, discussionQuestion} = result
        const {numUpdatedRows} = await pg
          .updateTable('TeamHealthCategorySummary')
          .set({summary, sentimentScore})
          .where('meetingId', '=', meetingId)
          .where('categoryId', '=', categoryId)
          .where('summary', 'is', null)
          .executeTakeFirst()
        // a second reveal of the same check can race this one, and only the first write counts
        if (Number(numUpdatedRows) === 0) return
        publishSummary(meetingId, categoryId)
        if (discussionQuestion) {
          await addConversationStarter(meetingId, discussionId, discussionQuestion, dataLoader)
        }
      })
    )
    stageResults.forEach((stageResult) => {
      if (stageResult.status === 'rejected') logSummaryError(meetingId, stageResult.reason)
    })
  } catch (e) {
    logSummaryError(meetingId, e)
  } finally {
    // a row still unwritten got no summary: the model failed or answered with something unusable,
    // or the job fell over before reaching it
    const abandoned = await pg
      .deleteFrom('TeamHealthCategorySummary')
      .where('meetingId', '=', meetingId)
      .where('summary', 'is', null)
      .returning('categoryId')
      .execute()
    abandoned.forEach(({categoryId}) => publishSummary(meetingId, categoryId))
    dataLoader.dispose()
  }
}

export default summarizeTeamHealthCategories
