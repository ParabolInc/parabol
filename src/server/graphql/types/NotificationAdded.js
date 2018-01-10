import {GraphQLObjectType} from 'graphql';
import Notification from 'server/graphql/types/Notification';

const NotificationAdded = new GraphQLObjectType({
  name: 'NotificationAdded',
  fields: () => ({
    notification: {
      type: Notification
    }
  })
});

export default NotificationAdded;
