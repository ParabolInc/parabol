// import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GraphQLObjectType, GraphQLID} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import StandardMutationError from './StandardMutationError'
import TeamMember from './TeamMember'
import User from './User'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'

export const AddADOAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddADOAuthSuccess',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    // atlassianIntegration: {
    //   type: AtlassianIntegration,
    //   description: 'The newly created auth',
    //   resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
    //     return dataLoader.get('freshAtlassianAuth').load({teamId, userId})
    //   }
    // },
    teamId: {
      type: GraphQLID
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member with the updated ADOAuth',
      resolve: ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated ADOAuth',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const AddADOAuthPayload = makeMutationPayload('AddADOAuthPayload', AddADOAuthSuccess)

export default AddADOAuthPayload
