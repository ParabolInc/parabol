import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import ReflectTemplate from './ReflectTemplate'

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
    }
  })
})

const UpdateTemplateScopePayload = makeMutationPayload(
  'UpdateTemplateScopePayload',
  UpdateTemplateScopeSuccess
)

export default UpdateTemplateScopePayload
