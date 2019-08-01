import {GraphQLObjectType, GraphQLList} from 'graphql'
import {resolveOrganization, resolveTeams} from '../resolvers'
import Organization from './Organization'
import Team from './Team'
import StandardMutationError from './StandardMutationError'

const UpgradeToProPayload = new GraphQLObjectType({
  name: 'UpgradeToProPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      description: 'The new Pro Org',
      resolve: resolveOrganization
    },
    teams: {
      type: new GraphQLList(Team),
      description: 'The updated teams under the org',
      resolve: resolveTeams
    }
  })
})

export default UpgradeToProPayload
