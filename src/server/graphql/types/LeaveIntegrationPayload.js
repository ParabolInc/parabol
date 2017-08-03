import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const LeaveIntegrationPayload = new GraphQLObjectType({
  name: 'LeaveIntegrationPayload',
  fields: () => ({
    globalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globalId of the integration with a removed member'
    },
    userId: {
      type: GraphQLID,
      description: 'The global userId of the viewer that left. if null, remove the entire integration'
    }
  })
});

export default LeaveIntegrationPayload;
