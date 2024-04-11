import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TeamMember from './TeamMember'
import makeMutationPayload from './makeMutationPayload'

export const ToggleTeamDrawerSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'ToggleTeamDrawerSuccess',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      resolve: async ({teamMemberId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    }
  })
})

const ToggleTeamDrawerPayload = makeMutationPayload(
  'ToggleTeamDrawerPayload',
  ToggleTeamDrawerSuccess
)

export default ToggleTeamDrawerPayload
