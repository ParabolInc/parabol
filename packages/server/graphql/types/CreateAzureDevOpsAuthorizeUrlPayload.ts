import {GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'

export const CreateAzureDevOpsAuthorizeUrlPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateAzureDevOpsAuthorizeUrlSuccess',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    url: {
      type: GraphQLString,
      description: 'Authorization URL including oauth_token to start authorization flow'
    }
  })
})

export default CreateAzureDevOpsAuthorizeUrlPayload
