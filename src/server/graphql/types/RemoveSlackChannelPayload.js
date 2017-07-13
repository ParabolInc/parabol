import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const RemoveSlackChannelPayload = new GraphQLObjectType({
  name: 'RemoveSlackChannelPayload',
  fields: () => ({
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
});

export default RemoveSlackChannelPayload;
