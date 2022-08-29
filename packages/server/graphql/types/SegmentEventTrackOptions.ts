import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLString
} from 'graphql'
import MeetingTypeEnum from './MeetingTypeEnum'
import NewMeetingPhaseTypeEnum from './NewMeetingPhaseTypeEnum'
import TaskServiceEnum from './TaskServiceEnum'
import TierEnum from './TierEnum'

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
    reflectionsCount: {type: GraphQLInt},
    action: {type: GraphQLString},
    searchQueryString: {type: GraphQLString},
    service: {type: TaskServiceEnum},
    searchQueryFilters: {type: GraphQLList(GraphQLID)},
    projectId: {type: GraphQLID},
    selectedAll: {type: GraphQLBoolean},
    domainId: {type: GraphQLID},
    CTAType: {type: TierEnum},
    taskId: {type: GraphQLID},
    meetingType: {type: MeetingTypeEnum},
    inMeeting: {type: GraphQLBoolean}
  })
})

export default SegmentEventTrackOptions
