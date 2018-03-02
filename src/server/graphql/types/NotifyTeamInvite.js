import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';
import User from 'server/graphql/types/User';
import TeamNotification from 'server/graphql/types/TeamNotification';

const NotifyTeamInvite = new GraphQLObjectType({
  name: 'NotifyTeamInvite',
  description: 'A notification sent to a user that was invited to a new team',
  interfaces: () => [Notification, TeamNotification],
  fields: () => ({
    inviter: {
      type: User,
      description: 'The user that triggered the invitation',
      resolve: ({inviterUserId}, args, {dataLoader}) => {
        return dataLoader.get('users').load(inviterUserId);
      }
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
});

export default NotifyTeamInvite;
