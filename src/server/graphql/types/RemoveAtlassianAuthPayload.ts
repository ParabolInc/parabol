import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import AtlassianProject from 'server/graphql/types/AtlassianProject'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {getUserId} from 'server/utils/authorization'

const RemoveAtlassianAuthPayload = new GraphQLObjectType({
  name: 'RemoveAtlassianAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authId: {
      type: GraphQLID,
      description: 'The ID of the authorization removed',
      resolve: async ({authId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const auth = await dataLoader.get('atlassianAuths').load(authId)
        return viewerId === auth.userId ? auth : null
      }
    },
    updatedProjects: {
      type: new GraphQLList(new GraphQLNonNull(AtlassianProject)),
      description: 'all the projects that were either removed or unlinked from user',
      resolve: async ({projectIds}, _args, {dataLoader}) => {
        return dataLoader.get('atlassianProjects').loadMany(projectIds)
      }
    },
    teamId: {
      type: GraphQLID
    }
  })
})

export default RemoveAtlassianAuthPayload
