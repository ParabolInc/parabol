import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {MeetingMember, MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import EstimatePhase from '../../database/types/EstimatePhase'
import MeetingPoker from '../../database/types/MeetingPoker'
import updateStage from '../../database/updateStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PokerResetDimensionPayload from '../types/PokerResetDimensionPayload'
import sendPokerMeetingRevoteToSegment from './helpers/sendPokerMeetingRevoteToSegment'

const pokerResetDimension = {
  type: GraphQLNonNull(PokerResetDimensionPayload),
  description: `Remove all votes, the final vote, and reset the stage`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {meetingId, stageId},
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
    const {
      endedAt,
      phases,
      meetingType,
      teamId,
      defaultFacilitatorUserId,
      facilitatorUserId
    } = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== MeetingTypeEnum.poker) {
      return {error: {message: 'Not a poker meeting'}}
    }
    if (isPhaseComplete(NewMeetingPhaseTypeEnum.ESTIMATE, phases)) {
      return {error: {message: 'Estimate phase is already complete'}}
    }
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== defaultFacilitatorUserId) {
        return {
          error: {message: 'Not meeting facilitator'}
        }
      }
      return {
        error: {message: 'Not meeting facilitator anymore'}
      }
    }

    // VALIDATION
    const estimatePhase = phases.find(
      (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
    )! as EstimatePhase
    const {stages} = estimatePhase
    const stage = stages.find((stage) => stage.id === stageId)
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    const updates = {
      isVoting: true,
      scores: [],
      finalScore: null
    }
    // mutate the cached meeting
    Object.assign(stage, updates)
    const updater = (estimateStage) => estimateStage.merge(updates)
    await updateStage(meetingId, stageId, updater)
    const data = {meetingId, stageId}

    const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    sendPokerMeetingRevoteToSegment(meeting, meetingMembers as MeetingMember[])

    publish(SubscriptionChannel.MEETING, meetingId, 'PokerResetDimensionSuccess', data, subOptions)
    return data
  }
}

export default pokerResetDimension
