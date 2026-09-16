import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import getPhase from '../../../utils/getPhase'
import getTeamHealthDisplayComment from '../../../utils/getTeamHealthDisplayComment'
import logError from '../../../utils/logError'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import type {DataLoaderWorker} from '../../graphql'
import {buildCommentContentBlock, createAIComment} from './addAIGeneratedContentToThreads'
import canAccessAI from './canAccessAI'
import getTeamHealthResultScore from './getTeamHealthResultScore'

const MAX_STARTER_LENGTH = 2000

/**
 * Opens each result stage's discussion with an AI comment that reads this cycle's score and
 * comments against the last few cycles, so the team has somewhere to start. Runs after the results
 * are revealed and is not awaited, since the reveal should never wait on the LLM. Each comment is
 * published as it lands, so a client already looking at the results sees it arrive.
 */
const seedTeamHealthDiscussions = async (
  meeting: TeamHealthMeeting,
  dataLoader: DataLoaderWorker
) => {
  const {id: meetingId, teamId, phases} = meeting
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!(await canAccessAI(team, dataLoader))) return
  const [responses, priorCycles] = await Promise.all([
    dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId),
    dataLoader.get('priorTeamHealthCyclesByMeetingId').load(meetingId)
  ])
  if (responses.length === 0) return
  const manager = new OpenAIServerManager()
  const pg = getKysely()
  const resultPhase = getPhase(phases, 'TEAM_HEALTH_RESULT')
  await Promise.all(
    resultPhase.stages.map(async ({questionId, discussionId}) => {
      const [question, {score}, existingComments] = await Promise.all([
        dataLoader.get('teamHealthQuestions').loadNonNull(questionId),
        getTeamHealthResultScore(meetingId, questionId, dataLoader),
        dataLoader.get('commentsByDiscussionId').load(discussionId)
      ])
      const {categoryId} = question
      const category = await dataLoader.get('teamHealthCategories').loadNonNull(categoryId)
      const stageResponses = responses.filter((response) => response.questionId === questionId)
      const current = {
        score,
        responseCount: stageResponses.filter(({score}) => score !== null).length,
        comments: stageResponses.flatMap((response) => {
          const comment = getTeamHealthDisplayComment(response)
          return comment ? [comment] : []
        })
      }
      const history = priorCycles.map(({endedAt, scoreByCategoryId, commentsByCategoryId}) => ({
        endedAt: endedAt.toISOString().slice(0, 10),
        score: scoreByCategoryId.get(categoryId) ?? null,
        comments: commentsByCategoryId.get(categoryId) ?? []
      }))
      if (current.score === null && history.every(({score}) => score === null)) return
      const starter = await manager.generateTeamHealthDiscussionStarter({
        category: category.name,
        question: question.question,
        current,
        priorCycles: history
      })
      if (!starter) return
      const threadSortOrder =
        Math.max(0, ...existingComments.map((comment) => comment.threadSortOrder)) + 1
      const comment = createAIComment(
        discussionId,
        buildCommentContentBlock(
          '🤖 Conversation starter',
          `<p>${starter.slice(0, MAX_STARTER_LENGTH)}</p>`
        ),
        threadSortOrder
      )
      await pg.insertInto('Comment').values(comment).execute()
      publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', {
        commentId: comment.id,
        meetingId
      })
    })
  ).catch((e) => {
    logError(e instanceof Error ? e : new Error(`seedTeamHealthDiscussions failed: ${e}`), {
      tags: {meetingId, op: 'seedTeamHealthDiscussions'}
    })
  })
}

export default seedTeamHealthDiscussions
