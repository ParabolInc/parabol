import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import ReflectTemplate from './ReflectTemplate'
import {GQLContext} from '../graphql'

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
        return dataLoader.get('reflectTemplates').load(templateId)
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
