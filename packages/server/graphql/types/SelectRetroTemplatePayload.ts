import {GraphQLObjectType} from 'graphql'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const SelectRetroTemplatePayload = new GraphQLObjectType<any, GQLContext>({
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
