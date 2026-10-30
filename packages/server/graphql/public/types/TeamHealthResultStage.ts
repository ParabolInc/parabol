import {canShowRespondentDetails} from '../../../../client/shared/utils/teamHealthAnonymity'
import type {TeamHealthResultStage as TeamHealthResultStageDB} from '../../../postgres/types/NewMeetingPhase'
import getTeamHealthDisplayComment from '../../../utils/getTeamHealthDisplayComment'
import isTeamHealthSummaryLoading from '../../../utils/isTeamHealthSummaryLoading'
import type {DataLoaderWorker} from '../../graphql'
import getTeamHealthResultScore from '../../mutations/helpers/getTeamHealthResultScore'
import type {TeamHealthResultStageResolvers} from '../resolverTypes'
import DiscussionThreadStage from './DiscussionThreadStage'
import NewMeetingStage from './NewMeetingStage'

export type TeamHealthResultStageSource = TeamHealthResultStageDB & {
  meetingId: string
  teamId: string
}

// revealing the results is the act of ending the meeting, so endedAt is the only reveal state. Keep
// the aggregates unreadable until then so a small response set can't be polled and de-anonymized
const isRevealed = async (meetingId: string, dataLoader: DataLoaderWorker) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  return !!meeting.endedAt
}

const getCategorySummary = async (
  meetingId: string,
  questionId: number,
  dataLoader: DataLoaderWorker
) => {
  if (!(await isRevealed(meetingId, dataLoader))) return null
  const [question, categorySummaries] = await Promise.all([
    dataLoader.get('teamHealthQuestions').loadNonNull(questionId),
    dataLoader.get('teamHealthCategorySummariesByMeetingId').load(meetingId)
  ])
  return categorySummaries.find(({categoryId}) => categoryId === question.categoryId) ?? null
}

const TeamHealthResultStage: TeamHealthResultStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_RESULT',
  // the interfaces' resolvers, named here so the team-only rules in permissions.ts wrap them. A rule on a field the
  // type doesn't resolve itself wraps the default resolver before interface resolvers are inherited
  meeting: NewMeetingStage.meeting,
  phase: NewMeetingStage.phase,
  readyUserIds: NewMeetingStage.readyUserIds,
  discussion: DiscussionThreadStage.discussion,
  // the phases JSON snapshots the raw question id
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  score: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return null
    const {score} = await getTeamHealthResultScore(meetingId, questionId, dataLoader)
    return score
  },
  scoreHistory: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return []
    const {scoreHistory} = await getTeamHealthResultScore(meetingId, questionId, dataLoader)
    return scoreHistory
  },
  respondentCount: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return null
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    return responses.filter(({questionId: id, score}) => id === questionId && score !== null).length
  },
  spreadScores: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return null
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    const scores = responses.flatMap((response) =>
      response.questionId === questionId && response.score !== null ? [response.score] : []
    )
    return canShowRespondentDetails(scores.length) ? scores : null
  },
  responses: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return []
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    return responses.filter((response) => response.questionId === questionId)
  },
  commentCount: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return 0
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    return responses.filter(
      (response) => response.questionId === questionId && !!getTeamHealthDisplayComment(response)
    ).length
  },
  summary: async ({meetingId, questionId}, _args, {dataLoader}) => {
    const categorySummary = await getCategorySummary(meetingId, questionId, dataLoader)
    return categorySummary?.summary ?? null
  },
  isLoadingSummary: async ({meetingId, questionId}, _args, {dataLoader}) => {
    const categorySummary = await getCategorySummary(meetingId, questionId, dataLoader)
    return !!categorySummary && isTeamHealthSummaryLoading(categorySummary)
  },
  sentimentScore: async ({meetingId, questionId}, _args, {dataLoader}) => {
    const categorySummary = await getCategorySummary(meetingId, questionId, dataLoader)
    return categorySummary?.sentimentScore ?? null
  },
  isAsync: () => true
}

export default TeamHealthResultStage
