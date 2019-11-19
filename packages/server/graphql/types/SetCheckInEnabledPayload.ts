import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import TeamMeetingSettings from './TeamMeetingSettings'

const SetCheckInEnabledPayload = new GraphQLObjectType({
  name: 'SetCheckInEnabledPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    settings: {
      type: TeamMeetingSettings,
      resolve: ({settingsId}, _args, {dataLoader}) => {
        return settingsId ? dataLoader.get('meetingSettings').load(settingsId) : null
      }
    }
  })
})

export default SetCheckInEnabledPayload
