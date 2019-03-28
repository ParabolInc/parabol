import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMember from 'server/graphql/types/TeamMember'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

const AtlassianProject = new GraphQLObjectType({
  name: 'AtlassianProject',
  description: 'An integration that connects Atlassian projects with parabol',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The project ID in atlassian'
    },
    adminUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The parabol userId of the admin for this repo (usually the creator). This is used as a fallback if the user does not have an atlassian auth'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the integration was created'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'true if active, else false'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that is linked to this integration'
    },
    teamMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamMember))),
      description: 'The users that can CRUD this integration',
      resolve: async ({userIds, teamId}, _args, {dataLoader}) => {
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

export default AtlassianProject
