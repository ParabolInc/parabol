import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

//export const IntegrationSync = new GraphQLObjectType({
//  name: 'IntegrationSync',
//  description: 'A channel/repo/etc that is synced with the Parabol team',
//  fields: () => ({
//    id: {type: new GraphQLNonNull(GraphQLID), description: 'shortid'},
//    slackChannelId: {
//      type: GraphQLID,
//      description: 'the sync id provided by the service, if available. Useful for fetching from their API'
//    }
//    // name: {
//    //   type: GraphQLString,
//    //   description: 'The name of the sync (repo, channel, etc)'
//    // },
//  })
//});

const Provider = new GraphQLObjectType({
  name: 'Provider',
  description: 'A token for a user to be used on 1 or more teams',
  fields: () => ({
    id: {
      description: 'shortid',
      type: new GraphQLNonNull(GraphQLID)
    },
    accessToken: {
      description: 'The access token to the service. Not the ID because some tokens may be shared across teams (eg slack)',
      type: new GraphQLNonNull(GraphQLID)
    },
    service: {
      type: GraphQLString,
      description: 'The name of the service'
    },
    teamIds: {
      type: new GraphQLList(GraphQLID),
      description: 'The teams that the token is linked to, if any'
    },
    userId: {
      type: GraphQLID,
      description: 'The user that the access token is attached to'
    },
    //syncs: {
    //  type: new GraphQLList(IntegrationSync),
    //  description: 'A channel/repo/etc that is synced with the Parabol team'
    //}
  })
});

export default Provider;