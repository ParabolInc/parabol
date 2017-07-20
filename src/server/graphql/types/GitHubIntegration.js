import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {globalIdField} from 'graphql-relay';
import {nodeInterface} from 'server/graphql/models/Node/nodeQuery';
import TeamMember from 'server/graphql/types/TeamMember';
import getRethink from 'server/database/rethinkDriver';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {GITHUB} from 'universal/utils/constants';

const GitHubIntegration = new GraphQLObjectType({
  name: GITHUB,
  description: 'An integration that connects github issues & PRs to Parabol projects',
  interfaces: () => [nodeInterface],
  fields: () => ({
    // shortid
    id: globalIdField(GITHUB, ({id}) => id),
    //blackList: {
    //  type: new GraphQLList(GraphQLID),
    //  description: 'A list of all the userIds that do not want to be associated with this repo'
    //},
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the integration was created'
    },
    nameWithOwner: {
      type: GraphQLString,
      description: 'The name of the repo. Follows format of OWNER/NAME'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'defaults to true. true if this is used'
    },
    userIds: {
      type: new GraphQLList(GraphQLID),
      description: '*The userIds connected to the repo so they can CRUD things under their own name'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that is linked to this integration'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the integration was updated'
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'The users that can CRUD this integration',
      resolve: async ({userIds, teamId}) => {
        // TODO if we wanna build a cache in front of our DB, this is a great place to start

        // no auth needed because everything returning a GitHubIntegration has already checked for teamId
        const teamMemberIds = userIds.map((userId) => `${userId}::${teamId}`);
        const r = getRethink();
        return r.table('TeamMember')
          .getAll(r.args(teamMemberIds), {index: 'id'});
      }
    }
  })
});

export default GitHubIntegration;

