import {GraphQLObjectType} from 'graphql'
import {resolveTeam} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import Team from 'server/graphql/types/Team'

const PromoteToTeamLeadPayload = new GraphQLObjectType({
  name: 'PromoteToTeamLeadPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
})

export default PromoteToTeamLeadPayload
