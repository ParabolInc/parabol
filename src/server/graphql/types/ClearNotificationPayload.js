import {GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';

const ClearNotificationPayload = new GraphQLObjectType({
  name: 'ClearNotificationPayload',
  fields: () => ({
    notification: {
      type: Notification,
      description: 'The deleted notifcation'
    }
  })
});

export default ClearNotificationPayload;
