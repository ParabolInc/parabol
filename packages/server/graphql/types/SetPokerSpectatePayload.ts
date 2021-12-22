import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import EstimateStage from './EstimateStage'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeetingMember from './PokerMeetingMember'
import {resolveGQLStagesFromPhase} from '../resolvers'

export const SetPokerSpectateSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetPokerSpectateSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingMember: {
      type: new GraphQLNonNull(PokerMeetingMember),
      description: 'The meeting member with the updated isSpectating value',
      resolve: async ({userId, meetingId}, _args: unknown, {dataLoader}) => {
        const meetingMemberId = toTeamMemberId(meetingId, userId)
        const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
        return meetingMember
      }
    },
    stages: {
      type: new GraphQLList(new GraphQLNonNull(EstimateStage)),
      description:
        'The stages that were updated if the viewer voted and then changed to spectating',
      resolve: resolveGQLStagesFromPhase
    }
  })
})

const SetPokerSpectatePayload = makeMutationPayload(
  'SetPokerSpectatePayload',
  SetPokerSpectateSuccess
)

export default SetPokerSpectatePayload
