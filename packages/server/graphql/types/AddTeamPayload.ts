import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveTeam, resolveTeamMember} from '../resolvers'
import Team from './Team'
import TeamMember from './TeamMember'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

export const addTeamFields = {
  error: {
    type: StandardMutationError
  },
  authToken: {
    type: GraphQLID,
    description: 'The new auth token sent to the mutator'
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

const AddTeamPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddTeamPayload',
  fields: () => addTeamFields
})

export default AddTeamPayload
