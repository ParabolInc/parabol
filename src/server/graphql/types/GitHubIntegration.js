import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {globalIdField} from 'graphql-relay';
import TeamMember from 'server/graphql/types/TeamMember';
import getRethink from 'server/database/rethinkDriver';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {GITHUB} from 'universal/utils/constants';

const GitHubIntegration = new GraphQLObjectType({
  name: GITHUB,
  description: 'An integration that connects github issues & PRs to Parabol tasks',
  fields: () => ({
    // shortid
    id: globalIdField(GITHUB, ({id}) => id),
    adminUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol userId of the admin for this repo (usually the creator)'
    },
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
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that is linked to this integration'
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'The users that can CRUD this integration',
      resolve: async ({userIds, teamId, teamMembers}) => {
        // very odd that i have to do this... possible regression in GraphQL?
        if (teamMembers) return teamMembers;

        // TODO if we wanna build a cache in front of our DB, this is a great place to start

        // no auth needed because everything returning a GitHubIntegration has already checked for teamId
        const teamMemberIds = userIds.map((userId) => `${userId}::${teamId}`);
        const r = getRethink();
        return r.table('TeamMember')
          .getAll(r.args(teamMemberIds), {index: 'id'});
      }
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the integration was updated'
    },
    userIds: {
      type: new GraphQLList(GraphQLID),
      description: '*The userIds connected to the repo so they can CRUD things under their own name'
    }
  })
});

export default GitHubIntegration;

