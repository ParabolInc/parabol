import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveTeam} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import Team from './Team'
import {GQLContext} from '../graphql'

const NotifyTeamArchived = new GraphQLObjectType<any, GQLContext>({
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
