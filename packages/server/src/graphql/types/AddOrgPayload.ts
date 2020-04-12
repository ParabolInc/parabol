import {GraphQLObjectType} from 'graphql'
import {resolveOrganization} from '../resolvers'
import {addTeamFields} from './AddTeamPayload'
import Organization from './Organization'
import {GQLContext} from '../graphql'

const AddOrgPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddOrgPayload',
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    ...addTeamFields
  })
})

export default AddOrgPayload
