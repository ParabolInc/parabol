import {GraphQLObjectType} from 'graphql'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import StandardMutationError from './StandardMutationError'

const SelectRetroTemplatePayload = new GraphQLObjectType({
  name: 'SelectRetroTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    retroMeetingSettings: {
      type: RetrospectiveMeetingSettings,
      resolve: ({meetingSettingsId}, _args, {dataLoader}) => {
        return meetingSettingsId ? dataLoader.get('meetingSettings').load(meetingSettingsId) : null
      }
    }
  })
})

export default SelectRetroTemplatePayload
