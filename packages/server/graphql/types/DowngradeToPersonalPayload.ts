import {GraphQLObjectType, GraphQLList} from 'graphql'
import {resolveOrganization, resolveTeams} from '../resolvers'
import Organization from './Organization'
import Team from './Team'
import StandardMutationError from './StandardMutationError'

const DowngradeToPersonalPayload = new GraphQLObjectType({
  name: 'DowngradeToPersonalPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      description: 'The new Personal Org',
      resolve: resolveOrganization
    },
    teams: {
      type: new GraphQLList(Team),
      description: 'The updated teams under the org',
      resolve: resolveTeams
    }
  })
})

export default DowngradeToPersonalPayload
