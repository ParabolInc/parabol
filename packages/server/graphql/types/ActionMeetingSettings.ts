import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const ActionMeetingSettings: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<
  any,
  GQLContext
>({
  name: 'ActionMeetingSettings',
  description: 'The action-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields()
  })
})

export default ActionMeetingSettings
