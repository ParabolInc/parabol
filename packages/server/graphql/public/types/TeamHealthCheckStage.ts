import type {TeamHealthCheckStage as TeamHealthCheckStageDB} from '../../../postgres/types/NewMeetingPhase'
import getOpenTeamHealthMeeting from '../../mutations/helpers/getOpenTeamHealthMeeting'
import type {TeamHealthCheckStageResolvers} from '../resolverTypes'

export type TeamHealthCheckStageSource = TeamHealthCheckStageDB & {
  meetingId: string
  teamId: string
}

const TeamHealthCheckStage: TeamHealthCheckStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK',
  openTeamHealthMeeting: ({teamId, startedTeamHealthMeetingId}, _args, {dataLoader}) => {
    return getOpenTeamHealthMeeting(teamId, startedTeamHealthMeetingId, dataLoader)
  },
  startedTeamHealthMeeting: async ({startedTeamHealthMeetingId}, _args, {dataLoader}) => {
    if (!startedTeamHealthMeetingId) return null
    const meeting = await dataLoader.get('newMeetings').load(startedTeamHealthMeetingId)
    return meeting?.meetingType === 'teamHealth' ? meeting : null
  }
}

export default TeamHealthCheckStage
