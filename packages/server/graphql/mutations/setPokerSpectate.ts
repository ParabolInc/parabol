import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import EstimateStage from '../../database/types/EstimateStage'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import {getUserId} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import SetPokerSpectatePayload from '../types/SetPokerSpectatePayload'
import {removeVoteForUserId} from './voteForPokerStory'

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
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, isSpectating}: {meetingId: string; isSpectating: boolean},
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

    // RESOLUTION
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    await r({
      meetingMember: r.table('MeetingMember').get(meetingMemberId).update({isSpectating}),
      teamMember: r
        .table('TeamMember')
        .get(teamMemberId)
        .update({isSpectatingPoker: isSpectating, updatedAt: now})
    }).run()

    // mutate the dataLoader cache
    meetingMember.isSpectating = isSpectating
    const dirtyStages: EstimateStage[] = []
    stages.forEach(async (stage) => {
      const {id: stageId, scores} = stage
      const viewerVotedInStage = scores.find(({userId}) => userId === viewerId)
      if (viewerVotedInStage) {
        const newStageScores = scores.filter(({userId}) => userId !== viewerId)
        stage.scores = newStageScores
        dirtyStages.push(stage)
        await removeVoteForUserId(viewerId, stageId, meetingId)
      }
    })
    const data = {meetingId, userId: viewerId, dirtyStages, teamId}
    publish(SubscriptionChannel.MEETING, meetingId, 'SetPokerSpectateSuccess', data, subOptions)
    return data
  }
}

export default setPokerSpectate
