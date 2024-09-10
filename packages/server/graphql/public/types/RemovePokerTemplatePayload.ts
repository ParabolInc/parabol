import {RemovePokerTemplatePayloadResolvers} from '../resolverTypes'

export type RemovePokerTemplatePayloadSource =
  | {
      templateId: string
      settingsId: string
    }
  | {error: {message: string}}

const RemovePokerTemplatePayload: RemovePokerTemplatePayloadResolvers = {
  pokerTemplate: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {templateId} = source
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },

  pokerMeetingSettings: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {settingsId} = source
    const settings = await dataLoader.get('meetingSettings').loadNonNull(settingsId)
    return settings as typeof settings & {meetingType: 'poker'}
  }
}

export default RemovePokerTemplatePayload
