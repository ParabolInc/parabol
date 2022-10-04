import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TeamMeetingSettings from './TeamMeetingSettings'

const SetMeetingSettingsPayload = new GraphQLObjectType<any, GQLContext>({
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
