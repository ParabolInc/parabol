import {GraphQLID, GraphQLNonNull} from 'graphql'
import {PokerCards, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RValue} from '../../database/stricterR'
import EstimateUserScore from '../../database/types/EstimateUserScore'
import MeetingPoker from '../../database/types/MeetingPoker'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import updateStage from '../../database/updateStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PokerRevealVotesPayload from '../types/PokerRevealVotesPayload'

const pokerRevealVotes = {
  type: new GraphQLNonNull(PokerRevealVotesPayload),
  description: 'Progresses the stage dimension to the reveal & discuss step',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, stageId}: {meetingId: string; stageId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH

    // fetch meetingMembers up here to reduce chance of race condition that a vote gets cast in between now & when we update the scores
    const [meetingMembers, meeting] = await Promise.all([
      dataLoader.get('meetingMembersByMeetingId').load(meetingId),
      dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingPoker>
    ])

    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    const {endedAt, phases, meetingType, teamId, createdBy, facilitatorUserId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
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
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const {stages} = estimatePhase
    const stage = stages.find((stage) => stage.id === stageId)
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    // add a pass card for everyone who was present but did not vote
    const {scores} = stage
    meetingMembers.forEach((meetingMember) => {
      const {userId, isSpectating} = meetingMember as PokerMeetingMember
      if (isSpectating) return
      const userScore = scores.find((score) => score.userId === userId)
      if (!userScore) {
        const passScore = new EstimateUserScore({userId, label: PokerCards.PASS_CARD as string})
        scores.push(passScore)
      }
    })

    stage.isVoting = false
    const updater = (estimateStage: RValue) =>
      estimateStage.merge({
        isVoting: false,
        // note that a race condition exists here. it's possible that i cast my vote after the meeting is fetched but before this update & that'll be overwritten
        scores
      })
    await updateStage(meetingId, stageId, 'ESTIMATE', updater)
    const data = {meetingId, stageId}
    publish(SubscriptionChannel.MEETING, meetingId, 'PokerRevealVotesSuccess', data, subOptions)
    return data
  }
}

export default pokerRevealVotes
