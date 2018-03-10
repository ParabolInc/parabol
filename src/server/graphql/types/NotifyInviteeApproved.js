import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';
import User from 'server/graphql/types/User';
import TeamNotification from 'server/graphql/types/TeamNotification';

const NotifyInviteeApproved = new GraphQLObjectType({
  name: 'NotifyInviteeApproved',
  description: 'A notification sent to a user when the person they invited got approved by the org leader',
  interfaces: () => [Notification, TeamNotification],
  fields: () => ({
    inviteeEmail: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email of the person being invited'
    },
    inviter: {
      type: User,
      description: 'The user that triggered the invitation',
      resolve: (source, args, {dataLoader}) => {
        return dataLoader.get('users').load(source.inviterUserId);
      }
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
});

export default NotifyInviteeApproved;
