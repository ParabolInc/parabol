import type {SelectTemplatePayloadResolvers} from '../resolverTypes'

export type SelectTemplatePayloadSource = {
  meetingSettingsId?: string
  error?: {message: string}
}

const SelectTemplatePayload: SelectTemplatePayloadResolvers = {
  meetingSettings: async (source, _args, {dataLoader}) => {
    const {meetingSettingsId} = source
    if (!meetingSettingsId) return null
    return (await dataLoader.get('meetingSettings').load(meetingSettingsId)) ?? null
  }
}

export default SelectTemplatePayload
