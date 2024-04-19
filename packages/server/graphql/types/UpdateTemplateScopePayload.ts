import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {GQLContext} from '../graphql'
import MeetingTemplate from './MeetingTemplate'
import TeamMeetingSettings from './TeamMeetingSettings'
import makeMutationPayload from './makeMutationPayload'

export const UpdateTemplateScopeSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTemplateScopeSuccess',
  fields: () => ({
    template: {
      type: new GraphQLNonNull(MeetingTemplate),
      description:
        'the template that was just updated, if downscoped, does not provide whole story',
      resolve: async ({templateId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    clonedTemplate: {
      type: MeetingTemplate,
      description: 'if downscoping a previously used template, this will be the replacement',
      resolve: async ({clonedTemplateId}, _args: unknown, {dataLoader}) => {
        return clonedTemplateId ? dataLoader.get('meetingTemplates').load(clonedTemplateId) : null
      }
    },
    settings: {
      type: new GraphQLNonNull(TeamMeetingSettings),
      description: 'The settings that contain the teamTemplates array that was modified',
      resolve: (
        {teamId, meetingType = 'retrospective'}: {teamId: string; meetingType: MeetingTypeEnum},
        _args: unknown,
        {dataLoader}
      ) => {
        return dataLoader.get('meetingSettingsByType').load({teamId, meetingType})
      }
    }
  })
})

const UpdateTemplateScopePayload = makeMutationPayload(
  'UpdateTemplateScopePayload',
  UpdateTemplateScopeSuccess
)

export default UpdateTemplateScopePayload
