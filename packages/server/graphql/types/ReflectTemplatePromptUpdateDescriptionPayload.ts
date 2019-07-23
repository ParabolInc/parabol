import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem'

const ReflectTemplatePromptUpdateDescriptionPayload = new GraphQLObjectType({
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
