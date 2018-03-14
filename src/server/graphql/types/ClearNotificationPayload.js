import {GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const ClearNotificationPayload = new GraphQLObjectType({
  name: 'ClearNotificationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    notification: {
      type: Notification,
      description: 'The deleted notifcation'
    }
  })
});

export default ClearNotificationPayload;
