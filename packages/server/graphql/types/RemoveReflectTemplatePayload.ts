import {GraphQLObjectType} from 'graphql'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import StandardMutationError from './StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const RemoveReflectTemplatePayload = new GraphQLObjectType({
  name: 'RemoveReflectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: ReflectTemplate,
      resolve: ({templateId}, _args, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    },
    retroMeetingSettings: {
      type: RetrospectiveMeetingSettings,
      resolve: ({settingsId}, _args, {dataLoader}) => {
        if (!settingsId) return null
        return dataLoader.get('meetingSettings').load(settingsId)
      }
    }
  })
})

export default RemoveReflectTemplatePayload
