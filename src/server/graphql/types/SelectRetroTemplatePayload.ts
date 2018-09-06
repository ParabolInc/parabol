import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import RetrospectiveMeetingSettings from 'server/graphql/types/RetrospectiveMeetingSettings'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const SelectRetroTemplatePayload = new GraphQLObjectType({
  name: 'SelectRetroTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    retroMeetingSettings: {
      type: new GraphQLNonNull(RetrospectiveMeetingSettings),
      resolve: ({meetingSettingsId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingSettings').load(meetingSettingsId)
      }
    }
  })
})

export default SelectRetroTemplatePayload
