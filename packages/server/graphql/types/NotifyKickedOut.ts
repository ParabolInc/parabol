import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import Notification, {notificationInterfaceFields} from './Notification'
import {NotificationEnumType} from './NotificationEnum'
import Team from './Team'
import User from './User'

const NotifyKickedOut: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<any, GQLContext>({
  name: 'NotifyKickedOut',
  description: 'A notification sent to someone who was just kicked off a team',
  interfaces: () => [Notification],
  isTypeOf: ({type}: {type: NotificationEnumType}) => type === 'KICKED_OUT',
  fields: () => ({
    ...notificationInterfaceFields,
    evictor: {
      type: new GraphQLNonNull(User),
      description: 'the user that evicted recipient',
      resolve: async (
        {evictorUserId}: {evictorUserId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        return dataLoader.get('users').load(evictorUserId)
      }
    },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team the user is joining'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the user was kicked out of'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team the task is on',
      resolve: ({teamId}: {teamId: string}, _args: unknown, {dataLoader}: GQLContext) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

export default NotifyKickedOut
