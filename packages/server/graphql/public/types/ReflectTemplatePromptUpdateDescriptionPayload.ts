import {ReflectTemplatePromptUpdateDescriptionPayloadResolvers} from '../resolverTypes'

export type ReflectTemplatePromptUpdateDescriptionPayloadSource =
  | {
      promptId: string
    }
  | {error: {message: string}}

const ReflectTemplatePromptUpdateDescriptionPayload: ReflectTemplatePromptUpdateDescriptionPayloadResolvers =
  {
    prompt: (source, _args, {dataLoader}) => {
      return 'promptId' in source
        ? dataLoader.get('reflectPrompts').loadNonNull(source.promptId)
        : null
    }
  }

export default ReflectTemplatePromptUpdateDescriptionPayload
