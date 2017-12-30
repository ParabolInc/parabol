import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';
import User from 'server/graphql/types/User';

const NotifyInvitation = new GraphQLObjectType({
  name: 'NotifyInvitation',
  description: 'A notification sent to a user concerning an invitation (request, joined)',
  interfaces: () => [Notification],
  fields: () => ({
    inviterUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person that invited the email'
    },
    inviteeEmail: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email of the person being invited'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the inviteeEmail is being invited to'
    },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The team name the inviteeEmail is being invited to'
    },
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

export default NotifyInvitation;
