import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ReflectTemplate from './ReflectTemplate'
import StandardMutationError from './StandardMutationError'

const RemoveReflectTemplatePromptPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: ReflectTemplate,
      resolve: ({templateId}, _args, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    prompt: {
      type: ReflectTemplate,
      resolve: ({promptId}, _args, {dataLoader}) => {
        if (!promptId) return null
        return dataLoader.get('reflectPrompts').load(promptId)
      }
    }
  })
})

export default RemoveReflectTemplatePromptPayload
