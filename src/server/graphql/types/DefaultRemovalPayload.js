import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const DefaultRemovalPayload = new GraphQLObjectType({
  name: 'DefaultRemovalPayload',
  fields: () => ({
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
});

export default DefaultRemovalPayload;
