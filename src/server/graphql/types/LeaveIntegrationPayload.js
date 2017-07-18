import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';

const LeaveIntegrationPayload = new GraphQLObjectType({
  name: 'LeaveIntegrationPayload',
  fields: () => ({
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
});

export default LeaveIntegrationPayload;
