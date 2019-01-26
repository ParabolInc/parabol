import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'
import Team from './Team'

const TimelineEventTeamCreated = new GraphQLObjectType({
  name: 'TimelineEventTeamCreated',
  description: 'An event triggered whenever a team is created',
  interfaces: () => [TimelineEvent],
  fields: () => ({
    ...timelineEventInterfaceFields(),
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The orgId this event is associated with'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId this event is associated with. Null if not traceable to one team'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that can see this event'
    },
    isOnboardTeam: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        'true if this is the first team auto-created for a user (does not apply to users who joined via invitation)'
    }
  })
})

export default TimelineEventTeamCreated
