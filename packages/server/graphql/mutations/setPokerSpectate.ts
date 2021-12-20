import {removeVoteForUserId} from './voteForPokerStory'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import SetPokerSpectatePayload from '../types/SetPokerSpectatePayload'
import getPhase from '../../utils/getPhase'

const setPokerSpectate = {
  type: new GraphQLNonNull(SetPokerSpectatePayload),
  description: `Set whether the user is spectating poker meeting`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isSpectating: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is spectating poker and does not want to vote. else false'
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stage where the viewer is toggling their spectate status'
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, isSpectating, stageId}: {meetingId: string; isSpectating: boolean; stageId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const [meetingMember, meeting] = await Promise.all([
      dataLoader.get('meetingMembers').load(meetingMemberId) as Promise<PokerMeetingMember>,
      dataLoader.get('newMeetings').load(meetingId)
    ])
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    const {endedAt, phases, meetingType, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }
    if (!meetingMember) {
      return {error: {message: 'Not in meeting'}}
    }

    // VALIDATION
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const {stages} = estimatePhase
    const stage = stages.find((stage) => stage.id === stageId)
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    const {scores} = stage
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    await r({
      meetingMember: r.table('MeetingMember').get(meetingMemberId).update({isSpectating}),
      teamMember: r
        .table('TeamMember')
        .get(teamMemberId)
        .update({isSpectatingPoker: isSpectating, updatedAt: now})
    }).run()
    const viewerHasVoted = !!scores.find(({userId}) => userId === viewerId)
    if (viewerHasVoted) {
      await removeVoteForUserId(viewerId, stageId, meetingId)
    }

    // mutate the dataLoader cache
    meetingMember.isSpectating = isSpectating
    const data = {meetingId, userId: viewerId}
    publish(SubscriptionChannel.MEETING, meetingId, 'SetPokerSpectateSuccess', data, subOptions)
    return data
  }
}

export default setPokerSpectate
