import ms from 'ms'
import {canShowRespondentDetails} from '../../../../client/shared/utils/teamHealthAnonymity'
import type {TeamHealthResultStage as TeamHealthResultStageDB} from '../../../postgres/types/NewMeetingPhase'
import type {DataLoaderWorker} from '../../graphql'
import getTeamHealthResultScore from '../../mutations/helpers/getTeamHealthResultScore'
import type {TeamHealthResultStageResolvers} from '../resolverTypes'

export type TeamHealthResultStageSource = TeamHealthResultStageDB & {
  meetingId: string
  teamId: string
}

// the summary job finishes well within this, so a summary still unwritten after it belongs to a job
// that died with its server and is never coming
const SUMMARY_LOADING_TIMEOUT = ms('10m')

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
  summary: async ({meetingId, questionId}, _args, {dataLoader}) => {
    const categorySummary = await getCategorySummary(meetingId, questionId, dataLoader)
    return categorySummary?.summary ?? null
  },
  isLoadingSummary: async ({meetingId, questionId}, _args, {dataLoader}) => {
    const categorySummary = await getCategorySummary(meetingId, questionId, dataLoader)
    if (!categorySummary || categorySummary.summary !== null) return false
    return Date.now() - categorySummary.createdAt.getTime() < SUMMARY_LOADING_TIMEOUT
  },
  sentimentScore: async ({meetingId, questionId}, _args, {dataLoader}) => {
    const categorySummary = await getCategorySummary(meetingId, questionId, dataLoader)
    return categorySummary?.sentimentScore ?? null
  },
  isAsync: () => true
}

export default TeamHealthResultStage
