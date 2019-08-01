import {GraphQLID, GraphQLList, GraphQLObjectType} from 'graphql'
import {
  makeResolveNotificationsForViewer,
  resolveNotificationForViewer,
  resolveTeam
} from '../resolvers'
import NotifyTeamArchived from './NotifyTeamArchived'
import Team from './Team'
import TeamNotification from './TeamNotification'
import StandardMutationError from './StandardMutationError'

const ArchiveTeamPayload = new GraphQLObjectType({
  name: 'ArchiveTeamPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    notification: {
      type: NotifyTeamArchived,
      description: 'A notification explaining that the team was archived and removed from view',
      resolve: resolveNotificationForViewer
    },
    removedTeamNotifications: {
      type: new GraphQLList(TeamNotification),
      descriptions: 'All the notifications pertaining to the team that are no longer relevant',
      resolve: makeResolveNotificationsForViewer('-', 'removedTeamNotifications')
    },
    removedSuggestedActionIds: {
      type: new GraphQLList(GraphQLID),
      description: 'all the suggested actions that never happened'
    }
  })
})

export default ArchiveTeamPayload
