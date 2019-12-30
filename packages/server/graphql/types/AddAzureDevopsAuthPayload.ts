import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {getUserId} from '../../utils/authorization'
import AzureDevopsAuth from './AzureDevopsAuth'
import User from './User'

const AddAzureDevopsAuthPayload = new GraphQLObjectType({
  name: 'AddAzureDevopsAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    azureDevopsAuth: {
      type: AzureDevopsAuth,
      description: 'The newly created auth',
      resolve: async ({azureDevopsAuthId}, _args, {dataLoader}) => {
        return dataLoader.get('azureDevopsAuths').load(azureDevopsAuthId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated azureDevopsAuth',
      resolve: (_source, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return dataLoader.get('users').load(viewerId)
      }
    }
  })
})

export default AddAzureDevopsAuthPayload
