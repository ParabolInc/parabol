import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import MattermostIntegration from './MattermostIntegration'
import User from './User'
import {GQLContext} from '../graphql'

const AddMattermostAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddMattermostAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
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

export default AddMattermostAuthPayload
