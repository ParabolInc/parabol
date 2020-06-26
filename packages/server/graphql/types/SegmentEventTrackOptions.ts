import {GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLString} from 'graphql'
import NewMeetingPhaseTypeEnum from './NewMeetingPhaseTypeEnum'

const SegmentEventTrackOptions = new GraphQLInputObjectType({
  name: 'SegmentEventTrackOptions',
  fields: () => ({
    teamId: {type: GraphQLID},
    orgId: {type: GraphQLID},
    phase: {type: NewMeetingPhaseTypeEnum},
    eventId: {type: GraphQLInt},
    actionType: {type: GraphQLString}
  })
})

export default SegmentEventTrackOptions
