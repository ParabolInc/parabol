import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import User from './User'
import makeMutationPayload from './makeMutationPayload'

export const RemoveIntegrationProviderSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveIntegrationProviderSuccess',
  fields: () => ({
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user who updated TeamMemberIntegrationAuth object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const RemoveIntegrationProviderPayload = makeMutationPayload(
  'RemoveIntegrationProviderPayload',
  RemoveIntegrationProviderSuccess
)

export default RemoveIntegrationProviderPayload
