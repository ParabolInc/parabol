import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import {AddTranscriptionBotSuccessResolvers} from '../resolverTypes'

export type AddTranscriptionBotSuccessSource = {
  meetingSettingsId: string
}

const AddTranscriptionBotSuccess: AddTranscriptionBotSuccessResolvers = {
  meetingSettings: async ({meetingSettingsId}, _args, {dataLoader}) => {
    const meetingSettings = (await dataLoader
      .get('meetingSettings')
      .load(meetingSettingsId)) as MeetingSettingsRetrospective
    return meetingSettings
  }
}

export default AddTranscriptionBotSuccess
