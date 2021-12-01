import {GraphQLID, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import AtlassianIntegration from './AtlassianIntegration'
import StandardMutationError from './StandardMutationError'
import TeamMember from './TeamMember'
import User from './User'

const AddAtlassianAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddAtlassianAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    atlassianIntegration: {
      type: AtlassianIntegration,
      description: 'The newly created auth',
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('freshAtlassianAuth').load({teamId, userId})
      }
    },
    teamId: {
      type: GraphQLID
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member with the updated atlassianAuth',
      resolve: ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated atlassianAuth',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddAtlassianAuthPayload
