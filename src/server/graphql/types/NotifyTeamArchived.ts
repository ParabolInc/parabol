import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveTeam} from 'server/graphql/resolvers'
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification'
import Team from 'server/graphql/types/Team'

const NotifyTeamArchived = new GraphQLObjectType({
  name: 'NotifyTeamArchived',
  description: 'A notification alerting the user that a team they were on is now archived',
  interfaces: () => [Notification],
  fields: () => ({
    team: {
      type: new GraphQLNonNull(Team),
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
})

export default NotifyTeamArchived
