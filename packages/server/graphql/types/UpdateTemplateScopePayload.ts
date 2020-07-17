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
