import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import JiraRemoteProject from 'server/graphql/types/JiraRemoteProject'
import TeamMember from 'server/graphql/types/TeamMember'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {getUserId} from 'server/utils/authorization'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

const AtlassianProject = new GraphQLObjectType({
  name: 'AtlassianProject',
  description: 'An integration that connects Atlassian projects with parabol',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The cloud ID that the project lives on'
    },
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The project ID in atlassian'
    },
    remoteProject: {
      type: new GraphQLNonNull(JiraRemoteProject),
      description: 'The full project document fetched from Jira',
      resolve: async ({cloudId, projectId, teamId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const accessToken = await dataLoader
          .get('freshAtlassianAccessToken')
          .load({teamId, userId: viewerId})
        return dataLoader.get('jiraRemoteProject').load({accessToken, cloudId, projectId})
      }
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
