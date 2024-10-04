import {UpdateRecurrenceSettingsSuccessResolvers} from '../resolverTypes'

export type UpdateRecurrenceSettingsSuccessSource = {
  meetingId: string
}

const UpdateRecurrenceSettingsSuccess: UpdateRecurrenceSettingsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Not a team prompt')
    return meeting
  }
}

export default UpdateRecurrenceSettingsSuccess
