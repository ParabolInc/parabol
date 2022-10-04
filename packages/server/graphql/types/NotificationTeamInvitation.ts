import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import {NotificationEnumType} from './NotificationEnum'
import Team from './Team'
import TeamInvitation from './TeamInvitation'
import TeamNotification from './TeamNotification'

const NotificationTeamInvitation: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'NotificationTeamInvitation',
  description: 'A notification sent to a user that was invited to a new team',
  interfaces: () => [Notification, TeamNotification],
  isTypeOf: ({type}: {type: NotificationEnumType}) => type === 'TEAM_INVITATION',
  fields: () => ({
    teamId: {
      description: 'FK',
      type: new GraphQLNonNull(GraphQLID)
    },
    invitationId: {
      description: 'FK',
      type: new GraphQLNonNull(GraphQLID)
    },
    invitation: {
      description: 'The invitation that triggered this notification',
      type: new GraphQLNonNull(TeamInvitation),
      resolve: async ({invitationId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teamInvitations').load(invitationId)
      }
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
})

export default NotificationTeamInvitation
