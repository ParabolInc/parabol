import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const TeamPromptMeetingSettings: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<
  any,
  GQLContext
>({
  name: 'TeamPromptMeetingSettings',
  description: 'The team prompt specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields()
  })
})

export default TeamPromptMeetingSettings
