import type {SetMeetingSettingsPayloadResolvers} from '../resolverTypes'

export type SetMeetingSettingsPayloadSource = {settingsId: string} | {error: {message: string}}

const SetMeetingSettingsPayload: SetMeetingSettingsPayloadResolvers = {
  error: (source) => {
    if ('error' in source) return source.error
    return null
  },
  settings: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('meetingSettings').loadNonNull(source.settingsId)
  }
}

export default SetMeetingSettingsPayload
