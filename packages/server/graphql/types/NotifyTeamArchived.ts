import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import {NotificationEnumType} from './NotificationEnum'
import Team from './Team'
import User from './User'

const NotifyTeamArchived = new GraphQLObjectType<any, GQLContext>({
  name: 'NotifyTeamArchived',
  description: 'A notification alerting the user that a team they were on is now archived',
  interfaces: () => [Notification],
  isTypeOf: ({type}: {type: NotificationEnumType}) => type === 'TEAM_ARCHIVED',
  fields: () => ({
    archivor: {
      type: new GraphQLNonNull(User),
      description: 'the user that archived the team',
      resolve: ({archivorUserId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(archivorUserId)
      }
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
})

export default NotifyTeamArchived
