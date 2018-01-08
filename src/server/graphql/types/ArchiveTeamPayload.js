import {GraphQLList, GraphQLObjectType} from 'graphql';
import {makeResolveNotificationsForViewer, resolveNotificationForViewer, resolveTeam} from 'server/graphql/resolvers';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import Team from 'server/graphql/types/Team';
import TeamNotification from 'server/graphql/types/TeamNotification';

const ArchiveTeamPayload = new GraphQLObjectType({
  name: 'ArchiveTeamPayload',
  fields: () => ({
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
    }
  })
});

export default ArchiveTeamPayload;
