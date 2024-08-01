import {TeamPromptMeetingMemberResolvers} from '../resolverTypes'

const TeamPromptMeetingMember: TeamPromptMeetingMemberResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'teamPrompt'
}

export default TeamPromptMeetingMember
