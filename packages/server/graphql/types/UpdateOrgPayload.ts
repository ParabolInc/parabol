import {GraphQLObjectType} from 'graphql'
import {resolveOrganization} from '../resolvers'
import Organization from './Organization'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const UpdateOrgPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateOrgPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      description: 'The updated org',
      resolve: resolveOrganization
    }
  })
})

export default UpdateOrgPayload
