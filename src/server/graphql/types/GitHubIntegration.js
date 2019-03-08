import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {globalIdField} from 'graphql-relay'
import TeamMember from 'server/graphql/types/TeamMember'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {GITHUB} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamMember))),
      description: 'The users that can CRUD this integration',
      resolve: async ({userIds, teamId, teamMembers}, args, {dataLoader}) => {
        const teamMemberIds = userIds.map((userId) => toTeamMemberId(teamId, userId))
        return dataLoader.get('teamMembers').loadMany(teamMemberIds)
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
})

export default GitHubIntegration
