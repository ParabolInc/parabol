import {GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import NotificationEnum from 'server/graphql/types/NotificationEnum';

const NotifyVersionInfo = new GraphQLObjectType({
  name: 'NotifyVersionInfo',
  description: 'A notification with the app version sent upon connection',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    type: {
      type: NotificationEnum
    },
    version: {
      type: GraphQLString,
      description: 'The version of the app the server is using'
    }
  })
});

export default NotifyVersionInfo;
