import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const ToggleManageTeamSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'ToggleManageTeamSuccess',
  fields: () => ({
    hideManageTeam: {
      description: 'Show/hide the manage team sidebar',
      type: GraphQLNonNull(GraphQLBoolean)
    }
  })
})

const ToggleManageTeamPayload = makeMutationPayload(
  'ToggleManageTeamPayload',
  ToggleManageTeamSuccess
)

export default ToggleManageTeamPayload
