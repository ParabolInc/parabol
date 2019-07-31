import {GraphQLObjectType} from 'graphql'
import {resolveOrganization} from '../resolvers'
import {addTeamFields} from './AddTeamPayload'
import Organization from './Organization'

const AddOrgPayload = new GraphQLObjectType({
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
