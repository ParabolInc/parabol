import {CipherId} from '../../../utils/CipherId'
import type {TeamPromptResponseAnswerResolvers} from '../resolverTypes'

const TeamPromptResponseAnswer: TeamPromptResponseAnswerResolvers = {
  id: ({id}) => CipherId.toClient(id, 'teamPromptResponseAnswer'),
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  },
  content: ({content}) => JSON.stringify(content)
}

export default TeamPromptResponseAnswer
