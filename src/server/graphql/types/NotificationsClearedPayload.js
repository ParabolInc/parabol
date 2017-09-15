import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const NotificationsClearedPayload = new GraphQLObjectType({
  name: 'NotificationsClearedPayload',
  fields: () => ({
    deletedIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'database Ids (not global Ids) of items deleted'
    }
  })
});

export default NotificationsClearedPayload;
