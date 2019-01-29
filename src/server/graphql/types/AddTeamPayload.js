import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveTeam, resolveTeamMember} from 'server/graphql/resolvers'
import Team from 'server/graphql/types/Team'
import TeamMember from 'server/graphql/types/TeamMember'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

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
