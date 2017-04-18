import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

export const IntegrationSync = new GraphQLObjectType({
  name: 'IntegrationSync',
  description: 'A channel/repo/etc that is synced with the Parabol team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'shortid'},
    slackChannelId: {
      type: GraphQLID,
      description: 'the sync id provided by the service, if available. Useful for fetching from their API'
    }
    // name: {
    //   type: GraphQLString,
    //   description: 'The name of the sync (repo, channel, etc)'
    // },
  })
});

export const Integration = new GraphQLObjectType({
  name: 'Integration',
  description: 'An invitation to become a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The access token to the service'},
    service: {
      type: GraphQLString,
      description: 'The name of the service'
    },
    teamId: {
      type: GraphQLID,
      description: 'The teamMember that the token is linked to'
    },
    userId: {
      type: GraphQLID,
      description: 'The user that the access token is attached to'
    },
    syncs: {
      type: new GraphQLList(IntegrationSync),
      description: 'A channel/repo/etc that is synced with the Parabol team'
    }
  })
});
