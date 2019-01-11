import {GraphQLObjectType} from 'graphql'
import {makeResolve, resolveTeam} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import Team from 'server/graphql/types/Team'
import TeamMember from 'server/graphql/types/TeamMember'

const PromoteToTeamLeadPayload = new GraphQLObjectType({
  name: 'PromoteToTeamLeadPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    oldLeader: {
      type: TeamMember,
      resolve: makeResolve('oldLeaderId', 'oldLeader', 'teamMembers')
    },
    newLeader: {
      type: TeamMember,
      resolve: makeResolve('newLeaderId', 'newLeader', 'teamMembers')
    }
  })
})

export default PromoteToTeamLeadPayload
