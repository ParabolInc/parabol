import {GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';

const NotificationRemoved = new GraphQLObjectType({
  name: 'NotificationRemoved',
  fields: () => ({
    notification: {
      type: Notification
    }
  })
});

export default NotificationRemoved;
