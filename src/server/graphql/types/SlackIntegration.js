import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {globalIdField} from 'graphql-relay';
import {SLACK} from 'universal/utils/constants';

const SlackIntegration = new GraphQLObjectType({
  name: SLACK,
  description: 'An integration that sends start/end meeting messages to a specified slack channel',
  fields: () => ({
    // shortid
    id: globalIdField(SLACK, ({id}) => id),
    channelId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the channel provided by the service, if available. Useful for fetching from their API'
    },
    channelName: {
      type: GraphQLString,
      description: 'The name of the channel. Shared with all, updated when the integration owner looks at it'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'defaults to true. true if this is used to send notifications'
    },
    notifications: {
      type: new GraphQLList(GraphQLString),
      description: 'The types of notifications the team wishes to receive'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that cares about these annoucements'
    }
  })
});

export default SlackIntegration;

