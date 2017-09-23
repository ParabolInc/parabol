import {GraphQLNonNull, GraphQLObjectType, GraphQLList} from 'graphql';
import Notification from 'server/graphql/types/Notification';

const NotificationsAddedPayload = new GraphQLObjectType({
  name: 'NotificationsAddedPayload',
  fields: () => ({
    notifications: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Notification)))
    }
  })
});

export default NotificationsAddedPayload;
