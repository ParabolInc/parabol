import {GraphQLObjectType, GraphQLList} from 'graphql'
import {resolveOrganization, resolveTeams} from 'server/graphql/resolvers'
import Organization from 'server/graphql/types/Organization'
import Team from 'server/graphql/types/Team'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

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
