import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';

const NotificationAddedPayload = new GraphQLObjectType({
  name: 'NotificationAddedPayload',
  fields: () => ({
    notification: {
      type: new GraphQLNonNull(Notification)
    }
  })
});

export default NotificationAddedPayload;
