import {GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';

const NotifyVersionInfo = new GraphQLObjectType({
  name: 'NotifyVersionInfo',
  description: 'A notification with the app version sent upon connection',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    version: {
      type: GraphQLString,
      description: 'The version of the app the server is using'
    }
  })
});

export default NotifyVersionInfo;
