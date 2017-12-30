import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';
import TeamRemovedNotification from 'server/graphql/types/TeamRemovedNotification';

const NotifyTeamArchived = new GraphQLObjectType({
  name: 'NotifyTeamArchived',
  description: 'A notification alerting the user that a team they were on is now archived',
  interfaces: () => [Notification, TeamRemovedNotification],
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
});

export default NotifyTeamArchived;
