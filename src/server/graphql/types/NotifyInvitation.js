import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import NotificationEnum from 'server/graphql/types/NotificationEnum';

const NotifyInvitation = new GraphQLObjectType({
  name: 'NotifyInvitation',
  description: 'A notification sent to a user concerning an invitation (request, joined)',
  interfaces: () => [Notification],
  fields: () => ({
    inviterUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person that invited the email'
    },
    inviterName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the person that invited the email'
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
    type: {
      type: new GraphQLNonNull(NotificationEnum)
    }
  })
});

export default NotifyInvitation;
