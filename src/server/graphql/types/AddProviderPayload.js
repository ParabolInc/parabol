import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLList} from 'graphql'
import ProviderRow from 'server/graphql/types/ProviderRow'
import Provider from 'server/graphql/types/Provider'
import User from 'server/graphql/types/User'
import TeamMember from 'server/graphql/types/TeamMember'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {getUserId} from 'server/utils/authorization'

const AddProviderPayload = new GraphQLObjectType({
  name: 'AddProviderPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    providerRow: {
      type: ProviderRow,
      resolve: ({providerRow, provider}, args, {authToken}) => {
        if (!provider) return null
        const viewerId = getUserId(authToken)
        const {userId} = provider
        if (viewerId === userId) return providerRow
        return {
          ...providerRow,
          accessToken: null
        }
      }
    },
    provider: {
      type: Provider,
      resolve: (source, args, {authToken}) => {
        const {provider} = source
        const viewerId = getUserId(authToken)
        return viewerId === provider.userId ? provider : null
      }
    },
    joinedIntegrationIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'All the integrationIds that the provider has successfully joined'
    },
    teamMember: {
      type: TeamMember
    },
    user: {
      type: User,
      description: 'The user with updated githubAuth',
      resolve: (_source, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return dataLoader.get('users').load(viewerId)
      }
    }
  })
})

export default AddProviderPayload
