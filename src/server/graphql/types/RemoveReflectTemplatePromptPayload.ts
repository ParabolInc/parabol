import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const RemoveReflectTemplatePromptPayload = new GraphQLObjectType({
  name: 'RemoveReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: new GraphQLNonNull(ReflectTemplate),
      resolve: ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    },
    prompt: {
      type: new GraphQLNonNull(ReflectTemplate),
      resolve: ({promptId}, _args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(promptId)
      }
    }
  })
})

export default RemoveReflectTemplatePromptPayload
