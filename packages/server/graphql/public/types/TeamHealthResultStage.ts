import type {TeamHealthResultStage as TeamHealthResultStageDB} from '../../../postgres/types/NewMeetingPhase'
import type {DataLoaderWorker} from '../../graphql'
import getTeamHealthResultScore from '../../mutations/helpers/getTeamHealthResultScore'
import type {TeamHealthResultStageResolvers} from '../resolverTypes'

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
  previousScore: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return null
    const {previousScore} = await getTeamHealthResultScore(meetingId, questionId, dataLoader)
    return previousScore
  },
  responses: async ({meetingId, questionId}, _args, {dataLoader}) => {
    if (!(await isRevealed(meetingId, dataLoader))) return []
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    return responses.filter((response) => response.questionId === questionId)
  },
  isAsync: () => true
}

export default TeamHealthResultStage
