import {GraphQLObjectType} from 'graphql'
import {makeResolve, resolveTeam} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import Team from './Team'
import TeamMember from './TeamMember'
import {GQLContext} from '../graphql'

const PromoteToTeamLeadPayload = new GraphQLObjectType<any, GQLContext>({
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
