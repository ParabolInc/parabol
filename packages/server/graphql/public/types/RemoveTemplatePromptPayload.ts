import type {RemoveTemplatePromptPayloadResolvers} from '../resolverTypes'

export type RemoveTemplatePromptPayloadSource = {
  promptId: string
}

const RemoveTemplatePromptPayload: RemoveTemplatePromptPayloadResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default RemoveTemplatePromptPayload
