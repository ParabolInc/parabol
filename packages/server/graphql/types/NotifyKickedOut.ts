import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import Notification, {notificationInterfaceFields} from './Notification'
import Team from './Team'
import User from './User'

const NotifyKickedOut = new GraphQLObjectType<any, GQLContext>({
  name: 'NotifyKickedOut',
  description: 'A notification sent to someone who was just kicked off a team',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    evictor: {
      type: GraphQLNonNull(User),
      description: 'the user that evicted recipient',
      resolve: async ({evictorUserId}, _args, {dataLoader}) => {
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
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

export default NotifyKickedOut
