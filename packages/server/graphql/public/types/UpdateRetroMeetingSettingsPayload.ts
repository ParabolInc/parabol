import type {RetrospectiveMeetingSettings} from '../../../postgres/types'
import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {UpdateRetroMeetingSettingsPayloadResolvers} from '../resolverTypes'

export type UpdateRetroMeetingSettingsPayloadSource = {
  meetingId: string
  settingsId: string
}

const UpdateRetroMeetingSettingsPayload: UpdateRetroMeetingSettingsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as RetrospectiveMeeting
  },
  meetingSettings: async ({settingsId}, _args, {dataLoader}) => {
    const settings = await dataLoader.get('meetingSettings').loadNonNull(settingsId)
    return settings as RetrospectiveMeetingSettings
  }
}

export default UpdateRetroMeetingSettingsPayload
