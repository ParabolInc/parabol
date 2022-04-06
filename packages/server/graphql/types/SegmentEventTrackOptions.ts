import {GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLString} from 'graphql'
import NewMeetingPhaseTypeEnum from './NewMeetingPhaseTypeEnum'
import TaskServiceEnum from './TaskServiceEnum'

const SegmentEventTrackOptions = new GraphQLInputObjectType({
  name: 'SegmentEventTrackOptions',
  fields: () => ({
    teamId: {type: GraphQLID},
    orgId: {type: GraphQLID},
    phase: {type: NewMeetingPhaseTypeEnum},
    eventId: {type: GraphQLInt},
    actionType: {type: GraphQLString},
    spotlightSearchQuery: {type: GraphQLString},
    meetingId: {type: GraphQLID},
    reflectionId: {type: GraphQLID},
    viewerId: {type: GraphQLID},
    reflectionsCount: {type: GraphQLInt},
    action: {type: GraphQLString},
    queryString: {type: GraphQLString},
    service: {type: TaskServiceEnum},
    searchQueryFilters: {type: GraphQLList(GraphQLString)}
  })
})

export default SegmentEventTrackOptions
