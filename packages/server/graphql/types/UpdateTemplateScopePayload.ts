import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {MeetingTypeEnum} from '../../../client/types/graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import ReflectTemplate from './ReflectTemplate'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'

export const UpdateTemplateScopeSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTemplateScopeSuccess',
  fields: () => ({
    template: {
      type: GraphQLNonNull(ReflectTemplate),
      description:
        'the template that was just updated, if downscoped, does not provide whole story',
      resolve: async ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    },
    clonedTemplate: {
      type: ReflectTemplate,
      description: 'if downscoping a previously used template, this will be the replacement',
      resolve: async ({clonedTemplateId}, _args, {dataLoader}) => {
        return clonedTemplateId ? dataLoader.get('reflectTemplates').load(clonedTemplateId) : null
      }
    },
    settings: {
      type: GraphQLNonNull(RetrospectiveMeetingSettings),
      description: 'The settings that contain the teamTemplates array that was modified',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader
          .get('meetingSettingsByType')
          .load({teamId, meetingType: MeetingTypeEnum.retrospective})
      }
    }
  })
})

const UpdateTemplateScopePayload = makeMutationPayload(
  'UpdateTemplateScopePayload',
  UpdateTemplateScopeSuccess
)

export default UpdateTemplateScopePayload
