import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLString
} from 'graphql'
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
    searchQueryString: {type: GraphQLString},
    service: {type: TaskServiceEnum},
    searchQueryFilters: {type: GraphQLList(GraphQLID)},
    projectId: {type: GraphQLID},
    selectedAll: {type: GraphQLBoolean},
    companyId: {type: GraphQLID}
  })
})

export default SegmentEventTrackOptions
