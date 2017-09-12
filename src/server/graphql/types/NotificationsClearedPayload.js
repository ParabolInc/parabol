import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const NotificationsClearedPayload = new GraphQLObjectType({
  name: 'NotificationsClearedPayload',
  fields: () => ({
    deletedIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))
    }
  })
});

export default NotificationsClearedPayload;
