import type {MoveTemplatePromptPayloadResolvers} from '../resolverTypes'

export type MoveTemplatePromptPayloadSource = {
  promptId: string
}

const MoveTemplatePromptPayload: MoveTemplatePromptPayloadResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default MoveTemplatePromptPayload
