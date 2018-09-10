import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import RetrospectiveMeetingSettings from 'server/graphql/types/RetrospectiveMeetingSettings'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const RemoveReflectTemplatePayload = new GraphQLObjectType({
  name: 'RemoveReflectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: new GraphQLNonNull(ReflectTemplate),
      resolve: ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    },
    retroMeetingSettings: {
      type: new GraphQLNonNull(RetrospectiveMeetingSettings),
      resolve: ({settingsId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingSettings').load(settingsId)
      }
    }
  })
})

export default RemoveReflectTemplatePayload
