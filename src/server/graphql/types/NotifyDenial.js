import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import TeamNotification from 'server/graphql/types/TeamNotification';

const NotifyDenial = new GraphQLObjectType({
  name: 'NotifyDenial',
  description: 'A notification alerting the user that their request was denied by the org billing leader',
  interfaces: () => [Notification, TeamNotification],
  fields: () => ({
    reason: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The reason, supplied by the org leader, that the request has been denied'
    },
    deniedByName: {
      type: GraphQLString,
      description: 'The name of the billing leader that denied the request'
    },
    inviteeEmail: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email of the person being invited'
    },
    ...notificationInterfaceFields
  })
});

export default NotifyDenial;
