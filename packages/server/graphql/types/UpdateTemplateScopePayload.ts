import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'

export const UpdateTemplateScopeSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTemplateScopeSuccess',
  fields: () => ({
    meetingSettings: {
      type: GraphQLNonNull(RetrospectiveMeetingSettings),
      description: 'The settings that contain the teamTemplates array that was modified',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader
          .get('meetingSettingsByType')
          .load({teamId, meetingType: MeetingTypeEnum.retrospective})
      }
    }
    // template: {
    // type: GraphQLNonNull(ReflectTemplate),
    // description: 'the template that was just updated, if downscoped, does not provide whole story',
    // resolve: async ({templateId}, _args, {dataLoader}) => {
    // return dataLoader.get('reflectTemplates').load(templateId)
    // }
    // }
  })
})

const UpdateTemplateScopePayload = makeMutationPayload(
  'UpdateTemplateScopePayload',
  UpdateTemplateScopeSuccess
)

export default UpdateTemplateScopePayload
