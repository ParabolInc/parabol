import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveTeam, resolveTeamMember} from '../resolvers'
import Team from './Team'
import TeamMember from './TeamMember'
import StandardMutationError from './StandardMutationError'

export const addTeamFields = {
  error: {
    type: StandardMutationError
  },
  team: {
    type: Team,
    resolve: resolveTeam
  },
  teamMember: {
    type: TeamMember,
    description: 'The teamMember that just created the new team, if this is a creation',
    resolve: resolveTeamMember
  },
  removedSuggestedActionId: {
    type: GraphQLID,
    description: 'The ID of the suggestion to create a new team'
  }
}

const AddTeamPayload = new GraphQLObjectType({
  name: 'AddTeamPayload',
  fields: () => addTeamFields
})

export default AddTeamPayload
