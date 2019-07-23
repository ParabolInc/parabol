import {GraphQLID, GraphQLInputObjectType} from 'graphql'
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum'

const SegmentEventTrackOptions = new GraphQLInputObjectType({
  name: 'SegmentEventTrackOptions',
  fields: () => ({
    teamId: {type: GraphQLID},
    orgId: {type: GraphQLID},
    phase: {type: NewMeetingPhaseTypeEnum}
  })
})

export default SegmentEventTrackOptions
