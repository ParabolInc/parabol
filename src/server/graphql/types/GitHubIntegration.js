import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {globalIdField} from 'graphql-relay';
import {nodeInterface} from 'server/graphql/models/Node/nodeQuery';

const GitHubIntegration = new GraphQLObjectType({
  name: 'GitHubIntegration',
  description: 'An integration that connects github issues & PRs to Parabol projects',
  interfaces: () => [nodeInterface],
  fields: () => ({
    // shortid
    id: globalIdField('GitHubIntegration', ({id}) => id),
    blackList: {
      type: new GraphQLList(GraphQLID),
      description: 'A list of all the userIds that do not want to be associated with this repo'
    },
    repoId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the repo provided by the service, if available. Useful for fetching from their API'
    },
    repoName: {
      type: GraphQLString,
      description: 'The name of the repo. Shared with all, updated when the integration owner looks at it'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'defaults to true. true if this is used to send notifications'
    },
    userIds: {
      type: new GraphQLList(GraphQLID),
      description: '*The userIds connected to the repo so they can CRUD things under their own name'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that cares about these annoucements'
    }
  })
});

export default GitHubIntegration;

