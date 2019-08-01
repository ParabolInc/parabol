import {GraphQLObjectType} from 'graphql'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const ActionMeetingSettings = new GraphQLObjectType({
  name: 'ActionMeetingSettings',
  description: 'The action-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields()
  })
})

export default ActionMeetingSettings
