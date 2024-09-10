import {TeamPromptMeetingSettingsResolvers} from '../resolverTypes'

const TeamPromptMeetingSettings: TeamPromptMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'teamPrompt'
}

export default TeamPromptMeetingSettings
