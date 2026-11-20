import {GraphQLError} from 'graphql'
import type {TeamHealthCheckResultStage as TeamHealthCheckResultStageDB} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'
import type {DataLoaderWorker} from '../../graphql'
import type {TeamHealthCheckResultStageResolvers} from '../resolverTypes'

export type TeamHealthCheckResultStageSource = TeamHealthCheckResultStageDB & {
  meetingId: string
  teamId: string
}

const loadTeamHealthMeeting = async (teamHealthMeetingId: string, dataLoader: DataLoaderWorker) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(teamHealthMeetingId)
  if (meeting.meetingType !== 'teamHealth') {
    throw new GraphQLError('The result stage does not point at a Team Health meeting', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
  }
  return meeting
}

const TeamHealthCheckResultStage: TeamHealthCheckResultStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK_RESULT',
  teamHealthMeeting: ({teamHealthMeetingId}, _args, {dataLoader}) => {
    return loadTeamHealthMeeting(teamHealthMeetingId, dataLoader)
  },
  resultStage: async ({teamHealthMeetingId, teamHealthResultStageId}, _args, {dataLoader}) => {
    const meeting = await loadTeamHealthMeeting(teamHealthMeetingId, dataLoader)
    const {stages} = getPhase(meeting.phases, 'TEAM_HEALTH_RESULT')
    const resultStage = stages.find(({id}) => id === teamHealthResultStageId)
    if (!resultStage) {
      throw new GraphQLError('The Team Health result stage no longer exists', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    }
    return {...resultStage, meetingId: meeting.id, teamId: meeting.teamId}
  }
}

export default TeamHealthCheckResultStage
