import {ReflectTemplatePromptUpdateGroupColorPayloadResolvers} from '../resolverTypes'

export type ReflectTemplatePromptUpdateGroupColorPayloadSource =
  | {
      promptId: string
    }
  | {error: {message: string}}

const ReflectTemplatePromptUpdateGroupColorPayload: ReflectTemplatePromptUpdateGroupColorPayloadResolvers =
  {
    prompt: (source, _args, {dataLoader}) => {
      return 'promptId' in source
        ? dataLoader.get('reflectPrompts').loadNonNull(source.promptId)
        : null
    }
  }

export default ReflectTemplatePromptUpdateGroupColorPayload
