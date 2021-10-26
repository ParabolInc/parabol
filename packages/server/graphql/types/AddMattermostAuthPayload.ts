import {GraphQLObjectType} from 'graphql'
import MattermostIntegration from './MattermostIntegration'
import makeMutationPayload from './makeMutationPayload'
import User from './User'
import {GQLContext} from '../graphql'

export const AddMattermostAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddMattermostAuthSuccess',
  fields: () => ({
    MattermostIntegration: {
      type: MattermostIntegration,
      description: 'The newly created MattermostIntegration object',
      resolve: async ({teamId}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('mattermostAuthByTeamId').load(teamId)
      }
    },
    user: {
      type: User,
      description: 'The user who updated MattermostIntegration object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const AddMattermostAuthPayload = makeMutationPayload(
  'AddMattermostAuthPayload',
  AddMattermostAuthSuccess
)

export default AddMattermostAuthPayload
