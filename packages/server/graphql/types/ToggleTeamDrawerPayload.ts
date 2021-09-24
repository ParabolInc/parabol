import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const ToggleTeamDrawerSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'ToggleTeamDrawerSuccess',
  fields: () => ({
    hideAgenda: {
      description: 'Show/hide the agenda drawer',
      type: GraphQLNonNull(GraphQLBoolean)
    },
    hideManageTeam: {
      description: 'Show/hide the manage team drawer',
      type: GraphQLNonNull(GraphQLBoolean)
    }
  })
})

const ToggleTeamDrawerPayload = makeMutationPayload(
  'ToggleTeamDrawerPayload',
  ToggleTeamDrawerSuccess
)

export default ToggleTeamDrawerPayload
