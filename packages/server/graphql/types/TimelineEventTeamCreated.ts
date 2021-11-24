import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Team from './Team'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'
import {CREATED_TEAM} from './TimelineEventTypeEnum'

const TimelineEventTeamCreated = new GraphQLObjectType<any>({
  name: 'TimelineEventTeamCreated',
  description: 'An event triggered whenever a team is created',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === CREATED_TEAM,
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
      description: 'The team that can see this event',
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

export default TimelineEventTeamCreated
