import {TeamHealthStageResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import TeamHealthStageDB from '../../../database/types/TeamHealthStage'
import isValid from '../../isValid'

export type TeamHealthStageSource = TeamHealthStageDB & {
  meetingId: string
}

const TeamHealthStage: TeamHealthStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH',
  meeting: ({meetingId}, _args, {dataLoader}) => dataLoader.get('newMeetings').load(meetingId),
  phase: async ({meetingId, phaseType}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {phases} = meeting
    return phases.find((phase) => phase.phaseType === phaseType)
  },
  isViewerReady: ({readyToAdvance}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return readyToAdvance?.includes(viewerId) ?? false
  },
  readyCount: async ({meetingId, readyToAdvance}, _args, {dataLoader}, ref) => {
    if (!readyToAdvance) return 0
    if (!meetingId) console.log('no meetingid', ref)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {facilitatorUserId} = meeting
    return readyToAdvance.filter((userId) => userId !== facilitatorUserId).length
  },
  timeRemaining: ({scheduledEndTime}) => {
    return scheduledEndTime ? scheduledEndTime.valueOf() - Date.now() : null
  },
  viewerVote: async ({votes}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return votes.find(({userId}) => userId === viewerId)?.label ?? null
  },
  votes: ({labels, votes, isRevealed}) => {
    if (!isRevealed) return null
    const counted = new Map<string, number>()
    votes.forEach((vote) => {
      const {label} = vote
      const currentCount = counted.get(label) ?? 0
      counted.set(label, currentCount + 1)
    })
    return labels.map((label) => counted.get(label) ?? 0)
  },
  votedUserIds: ({votes}) => votes.map(({userId}) => userId),
  votedUsers: async ({votes}, _args, {dataLoader}) => {
    const userIds = votes.map(({userId}) => userId)
    return (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  }
}

export default TeamHealthStage
