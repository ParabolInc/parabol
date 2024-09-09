import TeamHealthStageDB from '../../../database/types/TeamHealthStage'
import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import {TeamHealthStageResolvers} from '../resolverTypes'

export type TeamHealthStageSource = TeamHealthStageDB & {
  meetingId: string
  teamId: string
}

const TeamHealthStage: TeamHealthStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH',
  viewerVote: async ({labels, votes}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    const vote = votes?.find(({userId}) => userId === viewerId)?.vote
    return (vote !== undefined && labels[vote]) || null
  },
  votes: ({labels, votes, isRevealed}) => {
    if (!isRevealed) return null
    const counted = new Map<number, number>()
    votes.forEach(({vote}) => {
      const currentCount = counted.get(vote) ?? 0
      counted.set(vote, currentCount + 1)
    })
    return labels.map((_, idx) => counted.get(idx) ?? 0)
  },
  votedUserIds: ({votes}) => votes.map(({userId}) => userId),
  votedUsers: async ({votes}, _args, {dataLoader}) => {
    const userIds = votes.map(({userId}) => userId)
    return (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  }
}

export default TeamHealthStage
