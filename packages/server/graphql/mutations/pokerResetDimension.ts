import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {RValue} from '../../database/stricterR'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingPoker from '../../database/types/MeetingPoker'
import updateStage from '../../database/updateStage'
import removeMeetingTaskEstimates from '../../postgres/queries/removeMeetingTaskEstimates'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PokerResetDimensionPayload from '../types/PokerResetDimensionPayload'
import sendPokerMeetingRevoteToSegment from './helpers/sendPokerMeetingRevoteToSegment'

const pokerResetDimension = {
  type: new GraphQLNonNull(PokerResetDimensionPayload),
  description: `Remove all votes, the final vote, and reset the stage`,
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
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingPoker
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
    if (isPhaseComplete('ESTIMATE', phases)) {
      return {error: {message: 'Estimate phase is already complete'}}
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
    const updates = {
      isVoting: true,
      scores: []
    }
    // mutate the cached meeting
    Object.assign(stage, updates)
    const updater = (estimateStage: RValue) => estimateStage.merge(updates)
    await Promise.all([
      updateStage(meetingId, stageId, 'ESTIMATE', updater),
      removeMeetingTaskEstimates(meetingId, stageId)
    ])
    const data = {meetingId, stageId}

    const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    sendPokerMeetingRevoteToSegment(meeting, meetingMembers as MeetingMember[])

    publish(SubscriptionChannel.MEETING, meetingId, 'PokerResetDimensionSuccess', data, subOptions)
    return data
  }
}

export default pokerResetDimension
