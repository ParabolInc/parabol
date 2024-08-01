import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import TeamHealthVote from '../../../database/types/TeamHealthVote'
import updateStage from '../../../database/updateStage'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const upsertVote = async (meetingId: string, stageId: string, newVote: TeamHealthVote) => {
  const r = await getRethink()
  const updater = (stage: RValue) =>
    stage.merge({
      votes: r.branch(
        stage('votes')
          .offsetsOf((oldVote: RValue) => oldVote('userId').eq(newVote.userId))
          .nth(0)
          .default(-1)
          .eq(-1),
        stage('votes').append(newVote),
        stage('votes').changeAt(
          stage('votes')
            .offsetsOf((oldVote: RValue) => oldVote('userId').eq(newVote.userId))
            .nth(0),
          newVote
        )
      )
    })
  return updateStage(meetingId, stageId, 'TEAM_HEALTH', updater)
}

const setTeamHealthVote: MutationResolvers['setTeamHealthVote'] = async (
  _source,
  {meetingId, stageId, label},
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
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on the team'}}
  }
  if (endedAt) {
    return {error: {message: 'Meeting has ended'}}
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

  const vote = stage.labels.indexOf(label)
  if (vote === -1) {
    return {error: {message: 'Invalid label provided'}}
  }
  await upsertVote(meetingId, stageId, {userId: viewerId, vote})
  // update dataloader
  const existingVote = stage.votes.find((vote) => vote.userId === viewerId)
  if (existingVote) {
    existingVote.vote = vote
  } else {
    stage.votes.push({userId: viewerId, vote})
  }

  const data = {
    meetingId,
    stageId,
    teamId,
    stage: {
      ...stage,
      meetingId,
      teamId
    }
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'SetTeamHealthVoteSuccess', data, subOptions)

  return data
}

export default setTeamHealthVote
