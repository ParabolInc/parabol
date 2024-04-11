import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import updateStage from '../../../database/updateStage'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const revealTeamHealthVotes: MutationResolvers['revealTeamHealthVotes'] = async (
  _source,
  {meetingId, stageId},
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
  const {stages} = teamHealthPhase
  const stage = stages.find((stage) => stage.id === stageId)
  if (!stage || stage.phaseType !== 'TEAM_HEALTH') {
    return {error: {message: 'Invalid stageId provided'}}
  }
  if (stage.isRevealed) {
    return {error: {message: 'Votes are already revealed'}}
  }

  updateStage(meetingId, stageId, 'TEAM_HEALTH', (stage) => stage.merge({isRevealed: true}))
  stage.isRevealed = true

  const data = {
    meetingId,
    stageId,
    stage: {
      ...stage,
      meetingId
    }
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'RevealTeamHealthVotesSuccess', data, subOptions)

  return data
}

export default revealTeamHealthVotes
