import {GraphQLObjectType} from 'graphql'
import {GITHUB} from 'parabol-client/utils/constants'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {GQLContext} from '../graphql'
import GitHubAuth from './GitHubAuth'
import StandardMutationError from './StandardMutationError'
import TeamMember from './TeamMember'
import User from './User'

const AddGitHubAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddGitHubAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    githubAuth: {
      type: GitHubAuth,
      description: 'The newly created auth',
      resolve: async ({teamId, userId}) => {
        const r = await getRethink()
        return r
          .table('Provider')
          .getAll(teamId, {index: 'teamId'})
          .filter({service: GITHUB, isActive: true, userId})
          .nth(0)
          .default(null)
          .run()
      }
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member with the updated auth',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated githubAuth',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddGitHubAuthPayload
