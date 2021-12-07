import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import MattermostIntegration from './MattermostIntegration'
import makeMutationPayload from './makeMutationPayload'
import User from './User'
import {GQLContext} from '../graphql'

export const AddMattermostAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddMattermostAuthSuccess',
  fields: () => ({
    mattermostIntegration: {
      type: new GraphQLNonNull(MattermostIntegration),
      description: 'The newly created mattermost integration object',
      resolve: async ({userId, teamId}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('mattermostAuthByUserIdTeamId').load({userId, teamId})
      }
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user who updated mattermost integration object',
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
