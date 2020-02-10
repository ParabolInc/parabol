import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import RetroPhaseItem from './RetroPhaseItem'
import {GQLContext} from '../graphql'

const ReflectTemplatePromptUpdateDescriptionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectTemplatePromptUpdateDescriptionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    prompt: {
      type: RetroPhaseItem,
      resolve: ({promptId}, _args, {dataLoader}) => {
        if (!promptId) return null
        return dataLoader.get('customPhaseItems').load(promptId)
      }
    }
  })
})

export default ReflectTemplatePromptUpdateDescriptionPayload
