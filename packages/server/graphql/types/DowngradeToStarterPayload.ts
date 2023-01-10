import {GraphQLList, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveOrganization, resolveTeams} from '../resolvers'
import Organization from './Organization'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const DowngradeToStarterPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DowngradeToStarterPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      description: 'The new Starter Org',
      resolve: resolveOrganization
    },
    teams: {
      type: new GraphQLList(Team),
      description: 'The updated teams under the org',
      resolve: resolveTeams
    }
  })
})

export default DowngradeToStarterPayload
