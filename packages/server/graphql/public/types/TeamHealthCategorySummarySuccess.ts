import getPhase from '../../../utils/getPhase'
import isValid from '../../isValid'
import type {TeamHealthCategorySummarySuccessResolvers} from '../resolverTypes'

export type TeamHealthCategorySummarySuccessSource = {
  meetingId: string
  categoryId: number
}

const TeamHealthCategorySummarySuccess: TeamHealthCategorySummarySuccessResolvers = {
  stage: async ({meetingId, categoryId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth') throw new Error('Meeting is not a team health')
    const {phases, teamId} = meeting
    const {stages} = getPhase(phases, 'TEAM_HEALTH_RESULT')
    const questions = await dataLoader
      .get('teamHealthQuestions')
      .loadMany(stages.map(({questionId}) => questionId))
    const stage = stages.find((_stage, idx) => {
      const question = questions[idx]
      return isValid(question) && question.categoryId === categoryId
    })
    if (!stage) throw new Error('No result stage for the category')
    return {...stage, meetingId, teamId}
  }
}

export default TeamHealthCategorySummarySuccess
