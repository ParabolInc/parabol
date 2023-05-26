import {MutationResolvers} from '../resolverTypes'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import rMapIf from '../../../database/rMapIf'

const revealTeamHealthScores: MutationResolvers['revealTeamHealthScores'] = async (
  _source,
  {meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return {error: {message: 'Meeting not found'}}
  }
  const {endedAt, phases, teamId, createdBy, facilitatorUserId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on the team'}}
  }
  if (endedAt) {
    return {error: {message: 'Meeting has ended'}}
  }

  if (viewerId !== facilitatorUserId) {
    if (viewerId !== createdBy) {
      return {
        error: {message: 'Not meeting facilitator'}
      }
    }
    return {
      error: {message: 'Not meeting facilitator anymore'}
    }
  }

  // VALIDATION
  const teamHealthPhase = getPhase(phases, 'TEAM_HEALTH')
  if (!teamHealthPhase) {
    return {error: {message: 'Team health phase not found'}}
  }
  const {id: phaseId, isRevealed} = teamHealthPhase

  if (!isRevealed) {
    const r = await getRethink()
    const mapIf = rMapIf(r)
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update((meeting: any) => ({
        phases: mapIf(
          meeting('phases'),
          (phase: any) => phase('phaseType').eq('TEAM_HEALTH'),
          (phase: any) => phase.update({isRevealed: true})
        )
      }))
      .run()
    teamHealthPhase.isRevealed = true
  }

  const data = {
    meetingId,
    phaseId,
    phase: {
      ...teamHealthPhase,
      meetingId
    }
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'RevealTeamHealthScoresSuccess', data, subOptions)

  return data
}

export default revealTeamHealthScores
