import {GraphQLObjectType} from 'graphql'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'
import {GQLContext} from '../graphql'

const ActionMeetingSettings = new GraphQLObjectType<any, GQLContext>({
  name: 'ActionMeetingSettings',
  description: 'The action-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields()
  })
})

export default ActionMeetingSettings
