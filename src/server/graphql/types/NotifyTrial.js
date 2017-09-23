import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';

const NotifyTrial = new GraphQLObjectType({
  name: 'NotifyTrial',
  description: 'A notification alerting the user that the trial is expiring soon or expired',
  interfaces: () => [Notification],
  fields: () => ({
    trialExpiresAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The name of the team member requesting to become facilitator'
    },
    ...notificationInterfaceFields
  })
});

export default NotifyTrial;
