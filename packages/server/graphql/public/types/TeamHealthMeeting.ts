import type {TeamHealthMeetingResolvers} from '../resolverTypes'

const TeamHealthMeeting: TeamHealthMeetingResolvers = {
  template: async ({templateId}, _args, {dataLoader}) => {
    const template = await dataLoader.get('meetingTemplates').load(templateId)
    return template ?? null
  },
  responses: ({id: meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  }
}

export default TeamHealthMeeting
