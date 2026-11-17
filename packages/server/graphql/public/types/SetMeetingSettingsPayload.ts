import type {SetMeetingSettingsPayloadResolvers} from '../resolverTypes'

export type SetMeetingSettingsPayloadSource = {settingsId: string}

const SetMeetingSettingsPayload: SetMeetingSettingsPayloadResolvers = {
  settings: ({settingsId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingSettings').loadNonNull(settingsId)
  }
}

export default SetMeetingSettingsPayload
