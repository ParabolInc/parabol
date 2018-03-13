import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import SlackIntegration from 'server/graphql/types/SlackIntegration';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const AddSlackChannelPayload = new GraphQLObjectType({
  name: 'AddSlackChannelPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    channel: {
      type: new GraphQLNonNull(SlackIntegration)
    }
    // provider: {
    //  type: new GraphQLNonNull(Provider)
    // }
  })
});

export default AddSlackChannelPayload;
