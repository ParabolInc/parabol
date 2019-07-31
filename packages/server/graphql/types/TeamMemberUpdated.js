import {GraphQLObjectType} from 'graphql'
import {resolveTeamMember} from '../resolvers'
import TeamMember from './TeamMember'

const TeamMemberUpdated = new GraphQLObjectType({
  name: 'TeamMemberUpdated',
  fields: () => ({
    teamMember: {
      type: TeamMember,
      resolve: resolveTeamMember
    }
  })
})

export default TeamMemberUpdated
