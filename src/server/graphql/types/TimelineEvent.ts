import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import connectionDefinitions from 'server/graphql/connectionDefinitions'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import Organization from 'server/graphql/types/Organization'
import PageInfoDateCursor from 'server/graphql/types/PageInfoDateCursor'
import Team from 'server/graphql/types/Team'
import TimelineEventTypeEnum, {
  COMPLETED_RETRO_MEETING
} from 'server/graphql/types/TimelineEventTypeEnum'
import User from 'server/graphql/types/User'
import TimelineEventCompletedRetroMeeting from './TimelineEventCompletedRetroMeeting'

export const timelineEventInterfaceFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  actorId: {
    type: GraphQLID,
    description:
      'The userId that performed an action that created the event. Null if not traceable to one user'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: '* The timestamp the event was created at'
  },
  interactionCount: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'the number of times the user has interacted with (ie clicked) this event'
  },
  orgId: {
    type: GraphQLID,
    description: 'The orgId this event is associated with. Null if not traceable to one org'
  },
  organization: {
    type: Organization,
    description: 'The organization this event is associated with',
    resolve: ({orgId}, _args, {dataLoader}) => {
      return dataLoader.get('organizations').load(orgId)
    }
  },
  seenCount: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'the number of times the user has seen this event'
  },
  teamId: {
    type: GraphQLID,
    description: 'The teamId this event is associated with. Null if not traceable to one team'
  },
  team: {
    type: Team,
    description: 'The team that can see this event',
    resolve: ({teamId}, _args, {dataLoader}) => {
      return dataLoader.get('teams').load(teamId)
    }
  },
  eventType: {
    type: new GraphQLNonNull(TimelineEventTypeEnum),
    description: 'The specific type of event'
  },
  userId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '* The userId that can see this event'
  },
  user: {
    type: new GraphQLNonNull(User),
    description: 'The user than can see this event',
    resolve: ({userId}, _args, {dataLoader}) => {
      return dataLoader.get('users').load(userId)
    }
  }
})

const TimelineEvent = new GraphQLObjectType({
  name: 'TimelineEvent',
  description: 'A past event that is important to the viewer',
  fields: timelineEventInterfaceFields,
  resovleType: (value) => {
    const resolveTypeLookup = {
      [COMPLETED_RETRO_MEETING]: TimelineEventCompletedRetroMeeting
    }
    return resolveTypeLookup[value.type]
  }
})

const {connectionType, edgeType} = connectionDefinitions({
  name: TimelineEvent.name,
  nodeType: new GraphQLNonNull(TimelineEvent),
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const TimelineEventConnection = connectionType
export const TimelineEventEdge = edgeType
export default TimelineEvent
