import type {RemoveReflectTemplatePayloadResolvers} from '../resolverTypes'

export type RemoveReflectTemplatePayloadSource =
  | {templateId: string; settingsId: string}
  | {error: {message: string}}

const RemoveReflectTemplatePayload: RemoveReflectTemplatePayloadResolvers = {
  reflectTemplate: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('meetingTemplates').loadNonNull(source.templateId)
  },
  retroMeetingSettings: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('meetingSettings').loadNonNull(source.settingsId)
  }
}

export default RemoveReflectTemplatePayload
