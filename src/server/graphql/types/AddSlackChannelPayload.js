import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import SlackIntegration from 'server/graphql/types/SlackIntegration';

const AddSlackChannelPayload = new GraphQLObjectType({
  name: 'AddSlackChannelPayload',
  fields: () => ({
    channel: {
      type: new GraphQLNonNull(SlackIntegration)
    },
    //provider: {
    //  type: new GraphQLNonNull(Provider)
    //}
  })
});

export default AddSlackChannelPayload;