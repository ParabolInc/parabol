import {GraphQLList, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveOrganization, resolveTeams} from '../resolvers'
import Organization from './Organization'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const UpdateCreditCardPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateCreditCardPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      description: 'The organization that received the updated credit card',
      resolve: resolveOrganization
    },
    teamsUpdated: {
      type: new GraphQLList(Team),
      description: 'The teams that are now paid up',
      resolve: resolveTeams
    }
  })
})

export default UpdateCreditCardPayload
