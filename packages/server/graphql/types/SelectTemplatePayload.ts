import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import TeamMeetingSettings from './TeamMeetingSettings'

const SelectTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SelectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meetingSettings: {
      type: TeamMeetingSettings,
      resolve: ({meetingSettingsId}, _args: unknown, {dataLoader}) => {
        return meetingSettingsId ? dataLoader.get('meetingSettings').load(meetingSettingsId) : null
      }
    }
  })
})

export default SelectTemplatePayload
