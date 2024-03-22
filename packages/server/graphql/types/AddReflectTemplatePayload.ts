import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ReflectTemplate from './ReflectTemplate'
import StandardMutationError from './StandardMutationError'
import User from './User'
import {getUserId} from '../../utils/authorization'

const AddReflectTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddReflectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: ReflectTemplate,
      resolve: ({templateId}, _args: unknown, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    user: {
      type: User,
      resolve: (_, _args: unknown, {dataLoader, authToken}) => {
        const userId = getUserId(authToken)
        if (!userId) return null
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddReflectTemplatePayload
