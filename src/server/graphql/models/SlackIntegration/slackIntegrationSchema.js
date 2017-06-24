import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

const SlackIntegration = new GraphQLObjectType({
  name: 'SlackIntegration',
  description: 'An integration that sends start/end meeting messages to a specified slack channel',
  fields: () => ({
    id: {
      description: 'shortid',
      type: new GraphQLNonNull(GraphQLID)
    },
    // if we ever need it...
    //userData: {
    //  type: new GraphQLList(SlackUserData)
    //},
    channelId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the channel provided by the service, if available. Useful for fetching from their API'
    },
    channelName: {
      type: GraphQLString,
      description: 'The name of the channel. Shared with all, updated when the integration owner looks at it'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that cares about these annoucements'
    },
    userIds: {
      type: new GraphQLList(GraphQLID),
      description: 'All the users that can provide this integration'
    }
  })
});

export default SlackIntegration;