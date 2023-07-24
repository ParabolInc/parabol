import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TeamMeetingSettings from './TeamMeetingSettings'

export type SetMeetingSettingsPayloadSource = {
  error?: {
    title?: string
    message: string
  }
  settingsId?: string
}

const SetMeetingSettingsPayload = new GraphQLObjectType<
  SetMeetingSettingsPayloadSource,
  GQLContext
>({
  name: 'SetMeetingSettingsPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    settings: {
      type: TeamMeetingSettings,
      resolve: ({settingsId}, _args: unknown, {dataLoader}) => {
        return settingsId ? dataLoader.get('meetingSettings').load(settingsId) : null
      }
    }
  })
})

export default SetMeetingSettingsPayload
