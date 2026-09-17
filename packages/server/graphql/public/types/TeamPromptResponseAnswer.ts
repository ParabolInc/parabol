import TeamPromptResponseAnswerId from '../../../../client/shared/gqlIds/TeamPromptResponseAnswerId'
import type {TeamPromptResponseAnswerResolvers} from '../resolverTypes'

const TeamPromptResponseAnswer: TeamPromptResponseAnswerResolvers = {
  id: ({id}) => TeamPromptResponseAnswerId.join(id),
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  },
  content: ({content}) => JSON.stringify(content)
}

export default TeamPromptResponseAnswer
