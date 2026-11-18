import {GraphQLError} from 'graphql'
import getPhase from '../../../utils/getPhase'
import isValid from '../../isValid'
import type {TeamHealthCategorySummaryPayloadResolvers} from '../resolverTypes'

export type TeamHealthCategorySummaryPayloadSource = {
  meetingId: string
  categoryId: number
}

const TeamHealthCategorySummaryPayload: TeamHealthCategorySummaryPayloadResolvers = {
  stage: async ({meetingId, categoryId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth')
      throw new GraphQLError('Meeting is not a team health', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    const {phases, teamId} = meeting
    const {stages} = getPhase(phases, 'TEAM_HEALTH_RESULT')
    const questions = await dataLoader
      .get('teamHealthQuestions')
      .loadMany(stages.map(({questionId}) => questionId))
    const stage = stages.find((_stage, idx) => {
      const question = questions[idx]
      return isValid(question) && question.categoryId === categoryId
    })
    if (!stage)
      throw new GraphQLError('No result stage for the category', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return {...stage, meetingId, teamId}
  }
}

export default TeamHealthCategorySummaryPayload
