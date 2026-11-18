import type {RenameTemplatePromptPayloadResolvers} from '../resolverTypes'

export type RenameTemplatePromptPayloadSource = {
  promptId: string
}

const RenameTemplatePromptPayload: RenameTemplatePromptPayloadResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default RenameTemplatePromptPayload
