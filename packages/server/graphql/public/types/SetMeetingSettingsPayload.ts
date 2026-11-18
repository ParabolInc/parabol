import type {SetMeetingSettingsPayloadResolvers} from '../resolverTypes'

export type SetMeetingSettingsPayloadSource = {settingsId: string; meetingId?: string}

const SetMeetingSettingsPayload: SetMeetingSettingsPayloadResolvers = {
  settings: ({settingsId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingSettings').loadNonNull(settingsId)
  },
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return meetingId ? dataLoader.get('newMeetings').loadNonNull(meetingId) : null
  }
}

export default SetMeetingSettingsPayload
