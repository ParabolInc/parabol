import {ActionMeetingSettingsResolvers} from '../resolverTypes'

const ActionMeetingSettings: ActionMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'action'
}

export default ActionMeetingSettings
