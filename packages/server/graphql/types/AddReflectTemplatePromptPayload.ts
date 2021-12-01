import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ReflectPrompt from './ReflectPrompt'
import StandardMutationError from './StandardMutationError'

const AddReflectTemplatePromptPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    prompt: {
      type: ReflectPrompt,
      resolve: ({promptId}, _args: unknown, {dataLoader}) => {
        if (!promptId) return null
        return dataLoader.get('reflectPrompts').load(promptId)
      }
    }
  })
})

export default AddReflectTemplatePromptPayload
